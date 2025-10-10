import { User, Subscription, Admin } from '../models/index.js';
import { config } from '../config/environment.js';
import { USER_TYPES } from '../config/constants.js';
import { sendEmail } from '../utils/emailService.js';
import { emailTemplates } from '../utils/emailTemplates.js';

export class SubscriptionService {
    static async calculateCost(plan) {
        let cost = 0;
        if (plan === config.pricing.monthType) {
            cost = config.pricing.monthCost;
        } else {
            cost = config.pricing.yearCost;
        }
        return cost / 4; // Commission calculation
    }

    static async updateAdminTotal(cost) {
        await Admin.findOneAndUpdate(
            { type: 'main' },
            { $inc: { total: cost } }
        );
    }

    static async activateUserSubscription(userId, plan) {
        const cost = await this.calculateCost(plan);
        await this.updateAdminTotal(cost);
        await User.findOneAndUpdate(
            { _id: userId },
            { $set: { type: plan } }
        );
    }

    static async deactivateUserSubscription(userId) {
        await User.findOneAndUpdate(
            { _id: userId },
            { $set: { type: USER_TYPES.FREE } }
        );
    }

    static async createSubscription(user, subscription, subscriberId, plan, method) {
        const existingSubscription = await Subscription.findOne({ user });
        if (!existingSubscription) {
            const newSub = new Subscription({ user, subscription, subscriberId, plan, method });
            await newSub.save();
        }
    }

    static async cancelSubscription(subscriptionId, subject) {
        const subscriptionDetails = await Subscription.findOne({ subscription: subscriptionId });
        if (!subscriptionDetails) return;

        const userId = subscriptionDetails.user;
        await this.deactivateUserSubscription(userId);

        const userDetails = await User.findOne({ _id: userId });
        await Subscription.findOneAndDelete({ subscription: subscriptionId });

        await this.sendCancellationEmail(userDetails.email, userDetails.mName, subject);
    }

    static async sendCancellationEmail(email, name, subject) {
        const reactivateUrl = `${config.website.url}/pricing`;
        const html = emailTemplates.subscriptionStatusChanged(name, subject, reactivateUrl);
        await sendEmail(email, `${name} Your Subscription Plan Has Been ${subject}`, html);
    }

    static async sendRenewalEmail(subscriptionId) {
        const subscriptionDetails = await Subscription.findOne({ subscription: subscriptionId });
        if (!subscriptionDetails) return;

        const userId = subscriptionDetails.user;
        const userDetails = await User.findOne({ _id: userId });

        const html = emailTemplates.subscriptionRenewed(userDetails.mName);
        await sendEmail(
            userDetails.email,
            `${userDetails.mName} Your Subscription Plan Has Been Renewed`,
            html
        );
    }
}

