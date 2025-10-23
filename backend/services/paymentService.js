import Stripe from 'stripe';
import Flutterwave from 'flutterwave-node-v3';
import axios from 'axios';
import { config } from '../config/environment.js';

const stripe = new Stripe(config.stripe.secretKey);
const flw = new Flutterwave(config.flutterwave.publicKey, config.flutterwave.secretKey);

export class PaymentService {
    // Stripe
    static async createStripeCheckout(planId) {
        const session = await stripe.checkout.sessions.create({
            success_url: `${config.website.url}/payment-success/${planId}`,
            cancel_url: `${config.website.url}/payment-failed`,
            line_items: [
                {
                    price: planId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
        });
        return { url: session.url, id: session.id };
    }

    static async retrieveStripeSession(sessionId) {
        return await stripe.checkout.sessions.retrieve(sessionId);
    }

    static async retrieveStripeSubscription(subscriptionId) {
        return await stripe.subscriptions.retrieve(subscriptionId);
    }

    static async cancelStripeSubscription(subscriptionId) {
        return await stripe.subscriptions.cancel(subscriptionId);
    }

    // PayPal
    static getPayPalAuth() {
        return Buffer.from(`${config.paypal.clientId}:${config.paypal.secretKey}`).toString("base64");
    }

    static async createPayPalSubscription(planId, email, name, lastName, post, address, country) {
        const firstLine = address.split(',').slice(0, -1).join(',');
        const secondLine = address.split(',').pop();
        const auth = this.getPayPalAuth();

        const payload = {
            plan_id: planId,
            subscriber: {
                name: { given_name: name, surname: lastName },
                email_address: email,
                shipping_address: {
                    name: { full_name: name },
                    address: {
                        address_line_1: firstLine,
                        address_line_2: secondLine,
                        admin_area_2: country,
                        admin_area_1: country,
                        postal_code: post,
                        country_code: country
                    }
                }
            },
            application_context: {
                brand_name: config.website.company,
                locale: "en-US",
                shipping_preference: "SET_PROVIDED_ADDRESS",
                user_action: "SUBSCRIBE_NOW",
                payment_method: {
                    payer_selected: "PAYPAL",
                    payee_preferred: "IMMEDIATE_PAYMENT_REQUIRED"
                },
                return_url: `${config.website.url}/payment-success/${planId}`,
                cancel_url: `${config.website.url}/payment-failed`
            }
        };

        const response = await fetch('https://api-m.paypal.com/v1/billing/subscriptions', {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: {
                'Authorization': 'Basic ' + auth,
                'Content-Type': 'application/json'
            },
        });

        return await response.json();
    }

    static async getPayPalSubscription(subscriptionId) {
        const auth = this.getPayPalAuth();
        const response = await fetch(`https://api.paypal.com/v1/billing/subscriptions/${subscriptionId}`, {
            headers: {
                'Authorization': 'Basic ' + auth,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        return await response.json();
    }

    static async cancelPayPalSubscription(subscriptionId) {
        const auth = this.getPayPalAuth();
        const response = await fetch(`https://api.paypal.com/v1/billing/subscriptions/${subscriptionId}/cancel`, {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + auth,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ reason: "Not satisfied with the service" })
        });
        return response;
    }

    static async updatePayPalSubscription(subscriptionId, newPlanId) {
        const auth = this.getPayPalAuth();
        const response = await fetch(`https://api.paypal.com/v1/billing/subscriptions/${subscriptionId}/revise`, {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + auth,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                plan_id: newPlanId,
                application_context: {
                    brand_name: config.website.company,
                    locale: "en-US",
                    payment_method: {
                        payer_selected: "PAYPAL",
                        payee_preferred: "IMMEDIATE_PAYMENT_REQUIRED"
                    },
                    return_url: `${config.website.url}/payment-success/${newPlanId}`,
                    cancel_url: `${config.website.url}/payment-failed`
                }
            })
        });
        return await response.json();
    }

    // Razorpay
    static async createRazorpaySubscription(plan, email, fullAddress) {
        const requestBody = {
            plan_id: plan,
            total_count: 12,
            quantity: 1,
            customer_notify: 1,
            notes: {
                notes_key_1: fullAddress,
            },
            notify_info: {
                notify_email: email
            }
        };

        const configObj = {
            headers: {
                'Content-Type': 'application/json'
            },
            auth: {
                username: config.razorpay.keyId,
                password: config.razorpay.keySecret
            }
        };

        const response = await axios.post(
            'https://api.razorpay.com/v1/subscriptions',
            requestBody,
            configObj
        );
        return response.data;
    }

    static async getRazorpaySubscription(subscriptionId) {
        const configObj = {
            headers: {
                'Content-Type': 'application/json'
            },
            auth: {
                username: config.razorpay.keyId,
                password: config.razorpay.keySecret
            }
        };

        const response = await axios.get(
            `https://api.razorpay.com/v1/subscriptions/${subscriptionId}`,
            configObj
        );
        return response.data;
    }

    static async cancelRazorpaySubscription(subscriptionId) {
        // Validate Razorpay subscription ID format to prevent SSRF
        // Typical Razorpay subscriptionId format: sub_xxxxxxxx
        if (typeof subscriptionId !== 'string' || !/^sub_[a-zA-Z0-9]+$/.test(subscriptionId)) {
            throw new Error('Invalid subscription ID format.');
        }
        const requestBody = {
            cancel_at_cycle_end: 0
        };

        const configObj = {
            headers: {
                'Content-Type': 'application/json'
            },
            auth: {
                username: config.razorpay.keyId,
                password: config.razorpay.keySecret
            }
        };

        const response = await axios.post(
            `https://api.razorpay.com/v1/subscriptions/${subscriptionId}/cancel`,
            requestBody,
            configObj
        );
        return response.data;
    }

    // Paystack
    static async createPaystackPayment(planId, amountInZar, email) {
        const data = {
            email,
            amount: amountInZar,
            plan: planId
        };

        const response = await axios.post(
            'https://api.paystack.co/transaction/initialize',
            data,
            {
                headers: {
                    'Authorization': `Bearer ${config.paystack.secretKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (response.data.status) {
            return { url: response.data.data.authorization_url };
        }
        throw new Error('Paystack initialization failed');
    }

    static async getPaystackSubscription(email) {
        const response = await axios.get('https://api.paystack.co/subscription', {
            headers: {
                'Authorization': `Bearer ${config.paystack.secretKey}`
            }
        });

        const subscriptions = response.data.data;
        const subscription = subscriptions.find(sub => sub.customer.email === email);

        if (subscription) {
            return {
                subscription_code: subscription.subscription_code,
                createdAt: subscription.createdAt,
                updatedAt: subscription.updatedAt,
                customer_code: subscription.customer.customer_code
            };
        }
        return null;
    }

    static async getPaystackSubscriptionDetails(subscriberId) {
        const response = await axios.get(
            `https://api.paystack.co/subscription/${subscriberId}`,
            {
                headers: {
                    Authorization: `Bearer ${config.paystack.secretKey}`
                }
            }
        );

        return {
            subscription_code: response.data.data.subscription_code,
            createdAt: response.data.data.createdAt,
            updatedAt: response.data.data.updatedAt,
            customer_code: response.data.data.customer.customer_code,
            email_token: response.data.data.email_token,
        };
    }

    static async cancelPaystackSubscription(code, token) {
        const data = { code, token };
        const response = await axios.post(
            'https://api.paystack.co/subscription/disable',
            data,
            {
                headers: {
                    Authorization: `Bearer ${config.paystack.secretKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    }

    // Flutterwave
    static async getFlutterwaveSubscription(email) {
        const payload = { email };
        const response = await flw.Subscription.get(payload);
        return response['data'][0];
    }

    static async cancelFlutterwaveSubscription(subscriptionId) {
        const payload = { id: subscriptionId };
        return await flw.Subscription.cancel(payload);
    }
}

