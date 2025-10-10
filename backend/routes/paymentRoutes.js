import express from 'express';
import { Subscription, User } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { PaymentService } from '../services/paymentService.js';
import { SubscriptionService } from '../services/subscriptionService.js';
import { sendEmail } from '../utils/emailService.js';
import { emailTemplates } from '../utils/emailTemplates.js';
import { config } from '../config/environment.js';
import { validateRequired } from '../middleware/validation.js';
import { PAYMENT_METHODS } from '../config/constants.js';

const router = express.Router();

// STRIPE PAYMENT
router.post('/stripepayment', validateRequired(['planId']), asyncHandler(async (req, res) => {
    const { planId } = req.body;
    const result = await PaymentService.createStripeCheckout(planId);
    res.json(result);
}));

router.post('/stripedetails', validateRequired(['subscriberId', 'uid', 'plan']), asyncHandler(async (req, res) => {
    const { subscriberId, uid, plan } = req.body;

    await SubscriptionService.activateUserSubscription(uid, plan);
    const session = await PaymentService.retrieveStripeSession(subscriberId);

    res.send(session);
}));

router.post('/stripecancel', validateRequired(['id', 'email']), asyncHandler(async (req, res) => {
    const { id, email } = req.body;

    await PaymentService.cancelStripeSubscription(id);

    const subscriptionDetails = await Subscription.findOne({ subscriberId: email });
    const userId = subscriptionDetails.user;

    await SubscriptionService.deactivateUserSubscription(userId);

    const userDetails = await User.findOne({ _id: userId });
    await Subscription.findOneAndDelete({ subscriberId: id });

    const reactivateUrl = `${config.website.url}/pricing`;
    const html = emailTemplates.subscriptionCancelled(userDetails.mName, reactivateUrl);

    await sendEmail(userDetails.email, `${userDetails.mName} Your Subscription Plan Has Been Cancelled`, html);

    ApiResponse.success(res, {}, '');
}));

// PAYPAL PAYMENT
router.post('/paypal', validateRequired(['planId', 'email', 'name', 'lastName', 'post', 'address', 'country']), asyncHandler(async (req, res) => {
    const { planId, email, name, lastName, post, address, country, admin } = req.body;

    const session = await PaymentService.createPayPalSubscription(
        planId, email, name, lastName, post, address, country
    );

    res.send(session);
}));

router.post('/paypaldetails', validateRequired(['subscriberId', 'uid', 'plan']), asyncHandler(async (req, res) => {
    const { subscriberId, uid, plan } = req.body;

    await SubscriptionService.activateUserSubscription(uid, plan);
    const session = await PaymentService.getPayPalSubscription(subscriberId);

    res.send(session);
}));

router.post('/paypalcancel', validateRequired(['id', 'email']), asyncHandler(async (req, res) => {
    const { id, email } = req.body;

    await PaymentService.cancelPayPalSubscription(id);

    const subscriptionDetails = await Subscription.findOne({ subscriberId: email });
    const userId = subscriptionDetails.user;

    await SubscriptionService.deactivateUserSubscription(userId);

    const userDetails = await User.findOne({ _id: userId });
    await Subscription.findOneAndDelete({ subscription: id });

    const reactivateUrl = `${config.website.url}/pricing`;
    const html = emailTemplates.subscriptionCancelled(userDetails.mName, reactivateUrl);

    await sendEmail(userDetails.email, `${userDetails.mName} Your Subscription Plan Has Been Cancelled`, html);

    ApiResponse.success(res, {}, '');
}));

router.post('/paypalupdate', validateRequired(['id', 'idPlan']), asyncHandler(async (req, res) => {
    const { id, idPlan } = req.body;

    const session = await PaymentService.updatePayPalSubscription(id, idPlan);

    res.send(session);
}));

router.post('/paypalupdateuser', validateRequired(['id', 'mName', 'email', 'user', 'plan']), asyncHandler(async (req, res) => {
    const { id, mName, email, user, plan } = req.body;

    await Subscription.findOneAndUpdate({ subscription: id }, { $set: { plan } });
    await User.findOneAndUpdate({ _id: user }, { $set: { type: plan } });

    const html = emailTemplates.subscriptionModified(mName);

    await sendEmail(email, `${mName} Your Subscription Plan Has Been Modified`, html);

    ApiResponse.success(res, {}, '');
}));

// RAZORPAY PAYMENT
router.post('/razorpaycreate', validateRequired(['plan', 'email', 'fullAddress']), asyncHandler(async (req, res) => {
    const { plan, email, fullAddress } = req.body;

    const result = await PaymentService.createRazorpaySubscription(plan, email, fullAddress);

    res.send(result);
}));

router.post('/razorapydetails', validateRequired(['subscriberId', 'uid', 'plan']), asyncHandler(async (req, res) => {
    const { subscriberId, uid, plan } = req.body;

    await SubscriptionService.activateUserSubscription(uid, plan);
    const result = await PaymentService.getRazorpaySubscription(subscriberId);

    res.send(result);
}));

router.post('/razorapypending', validateRequired(['sub']), asyncHandler(async (req, res) => {
    const { sub } = req.body;

    const result = await PaymentService.getRazorpaySubscription(sub);

    res.send(result);
}));

router.post('/razorpaycancel', validateRequired(['id', 'email']), asyncHandler(async (req, res) => {
    const { id, email } = req.body;

    await PaymentService.cancelRazorpaySubscription(id);

    const subscriptionDetails = await Subscription.findOne({ subscriberId: email });
    const userId = subscriptionDetails.user;

    await SubscriptionService.deactivateUserSubscription(userId);

    const userDetails = await User.findOne({ _id: userId });
    await Subscription.findOneAndDelete({ subscription: id });

    const reactivateUrl = `${config.website.url}/pricing`;
    const html = emailTemplates.subscriptionCancelled(userDetails.mName, reactivateUrl);

    await sendEmail(userDetails.email, `${userDetails.mName} Your Subscription Plan Has Been Cancelled`, html);

    ApiResponse.success(res, {}, '');
}));

// PAYSTACK PAYMENT
router.post('/paystackpayment', validateRequired(['planId', 'amountInZar', 'email']), asyncHandler(async (req, res) => {
    const { planId, amountInZar, email } = req.body;

    const result = await PaymentService.createPaystackPayment(planId, amountInZar, email);

    res.json(result);
}));

router.post('/paystackfetch', validateRequired(['email', 'uid', 'plan']), asyncHandler(async (req, res) => {
    const { email, uid, plan } = req.body;

    await SubscriptionService.activateUserSubscription(uid, plan);
    const details = await PaymentService.getPaystackSubscription(email);

    if (!details) {
        return ApiResponse.error(res, 'Subscription not found');
    }

    res.json({ details });
}));

router.post('/paystackcancel', validateRequired(['code', 'token', 'email']), asyncHandler(async (req, res) => {
    const { code, token, email } = req.body;

    await PaymentService.cancelPaystackSubscription(code, token);

    const subscriptionDetails = await Subscription.findOne({ subscriberId: email });
    const userId = subscriptionDetails.user;

    await SubscriptionService.deactivateUserSubscription(userId);

    const userDetails = await User.findOne({ _id: userId });
    await Subscription.findOneAndDelete({ subscriberId: code });

    const reactivateUrl = `${config.website.url}/pricing`;
    const html = emailTemplates.subscriptionCancelled(userDetails.mName, reactivateUrl);

    await sendEmail(email, `${userDetails.mName} Your Subscription Plan Has Been Cancelled`, html);

    ApiResponse.success(res, {}, '');
}));

// FLUTTERWAVE PAYMENT
router.post('/flutterdetails', validateRequired(['email', 'uid', 'plan']), asyncHandler(async (req, res) => {
    const { email, uid, plan } = req.body;

    await SubscriptionService.activateUserSubscription(uid, plan);
    const result = await PaymentService.getFlutterwaveSubscription(email);

    res.send(result);
}));

router.post('/flutterwavecancel', validateRequired(['code', 'token', 'email']), asyncHandler(async (req, res) => {
    const { code, token, email } = req.body;

    const response = await PaymentService.cancelFlutterwaveSubscription(code);

    if (!response) {
        return ApiResponse.error(res, 'Failed to cancel subscription');
    }

    const subscriptionDetails = await Subscription.findOne({ subscriberId: email });
    const userId = subscriptionDetails.user;

    await SubscriptionService.deactivateUserSubscription(userId);

    const userDetails = await User.findOne({ _id: userId });
    await Subscription.findOneAndDelete({ subscriberId: token });

    const reactivateUrl = `${config.website.url}/pricing`;
    const html = emailTemplates.subscriptionCancelled(userDetails.mName, reactivateUrl);

    await sendEmail(email, `${userDetails.mName} Your Subscription Plan Has Been Cancelled`, html);

    ApiResponse.success(res, {}, '');
}));

// SUBSCRIPTION DETAILS (MULTI-PROVIDER)
router.post('/subscriptiondetail', validateRequired(['uid', 'email']), asyncHandler(async (req, res) => {
    const { uid, email } = req.body;

    const userDetails = await Subscription.findOne({ user: uid });

    if (!userDetails) {
        return ApiResponse.error(res, 'Subscription not found');
    }

    let session;
    const method = userDetails.method;

    switch (method) {
        case PAYMENT_METHODS.STRIPE:
            session = await PaymentService.retrieveStripeSubscription(userDetails.subscriberId);
            break;
        case PAYMENT_METHODS.PAYPAL:
            session = await PaymentService.getPayPalSubscription(userDetails.subscription);
            break;
        case PAYMENT_METHODS.FLUTTERWAVE:
            session = await PaymentService.getFlutterwaveSubscription(email);
            break;
        case PAYMENT_METHODS.PAYSTACK:
            session = await PaymentService.getPaystackSubscriptionDetails(userDetails.subscriberId);
            break;
        case PAYMENT_METHODS.RAZORPAY:
            session = await PaymentService.getRazorpaySubscription(userDetails.subscription);
            break;
        default:
            return ApiResponse.error(res, 'Invalid payment method');
    }

    res.json({ session, method });
}));

// SEND RECEIPT
router.post('/sendreceipt', validateRequired(['html', 'email', 'plan', 'subscriberId', 'user', 'method', 'subscription']), asyncHandler(async (req, res) => {
    const { html, email, plan, subscriberId, user, method, subscription } = req.body;

    await SubscriptionService.createSubscription(user, subscription, subscriberId, plan, method);

    await sendEmail(email, 'Subscription Payment', html);

    ApiResponse.success(res, {}, 'Receipt sent to your mail');
}));

// DOWNLOAD RECEIPT
router.post('/downloadreceipt', validateRequired(['html', 'email']), asyncHandler(async (req, res) => {
    const { html, email } = req.body;

    await sendEmail(email, 'Subscription Receipt', html);

    ApiResponse.success(res, {}, 'Receipt sent to your mail');
}));

// PAYPAL WEBHOOKS
router.post('/paypalwebhooks', asyncHandler(async (req, res) => {
    const body = req.body;
    const eventType = body.event_type;

    switch (eventType) {
        case 'BILLING.SUBSCRIPTION.CANCELLED':
            await SubscriptionService.cancelSubscription(body.resource.id, "Cancelled");
            break;
        case 'BILLING.SUBSCRIPTION.EXPIRED':
            await SubscriptionService.cancelSubscription(body.resource.id, "Expired");
            break;
        case 'BILLING.SUBSCRIPTION.SUSPENDED':
            await SubscriptionService.cancelSubscription(body.resource.id, "Suspended");
            break;
        case 'BILLING.SUBSCRIPTION.PAYMENT.FAILED':
            await SubscriptionService.cancelSubscription(body.resource.id, "Disabled Due To Payment Failure");
            break;
        case 'PAYMENT.SALE.COMPLETED':
            await SubscriptionService.sendRenewalEmail(body.resource.billing_agreement_id);
            break;
    }

    res.status(200).send();
}));

export default router;

