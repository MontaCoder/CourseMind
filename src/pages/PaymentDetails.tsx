import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building, CheckCircle, CreditCard, CreditCard as CreditCardIcon, DollarSign, Globe, HandCoins, MapPin } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  amountInZarOne,
  amountInZarTwo,
  companyName,
  FreeCost,
  FreeType,
  MonthCost,
  MonthType,
  paypalEnabled,
  paypalPlanIdOne,
  paypalPlanIdTwo,
  paystackEnabled,
  paystackPlanIdOne,
  paystackPlanIdTwo,
  razorpayEnabled,
  razorpayPlanIdOne,
  razorpayPlanIdTwo,
  stripeEnabled,
  stripePlanIdOne,
  stripePlanIdTwo,
  YearCost,
  YearType
} from '@/constants';
import api from '@/lib/api';

type BillingInfo = {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
};

type PaymentMethod = 'paypal' | 'stripe' | 'paystack' | 'razorpay';

const plans = {
  free: { name: FreeType, price: FreeCost },
  monthly: { name: MonthType, price: MonthCost },
  yearly: { name: YearType, price: YearCost }
};

const planFeatures = [
  { name: FreeType, features: ['Generate 5 Sub-Topics', 'Lifetime access', 'Theory & Image Course', 'Ai Teacher Chat'] },
  { name: MonthType, features: ['Generate 10 Sub-Topics', '1 Month Access', 'Theory & Image Course', 'Ai Teacher Chat', 'Course In 23+ Languages', 'Create Unlimited Course', 'Video & Theory Course'] },
  { name: YearType, features: ['Generate 10 Sub-Topics', '1 Year Access', 'Theory & Image Course', 'Ai Teacher Chat', 'Course In 23+ Languages', 'Create Unlimited Course', 'Video & Theory Course'] }
];

const methods: Array<{ id: PaymentMethod; label: string; enabled: boolean; icon: typeof CreditCard; text: string; iconClass: string }> = [
  { id: 'paypal', label: 'PayPal', enabled: paypalEnabled, icon: Globe, text: "You'll be redirected to PayPal to complete your purchase securely.", iconClass: 'text-blue-500' },
  { id: 'stripe', label: 'Stripe', enabled: stripeEnabled, icon: CreditCardIcon, text: "You'll be redirected to Stripe to complete your purchase securely.", iconClass: 'text-indigo-500' },
  { id: 'paystack', label: 'Paystack', enabled: paystackEnabled, icon: HandCoins, text: "You'll be redirected to paystack to complete your purchase securely.", iconClass: 'text-purple-500' },
  { id: 'razorpay', label: 'Razorpay', enabled: razorpayEnabled, icon: DollarSign, text: "You'll be redirected to Razorpay to complete your purchase securely.", iconClass: 'text-blue-600' }
];

const countryCodes = 'AF AL DZ AD AO AG AR AM AU AT AZ BS BH BD BB BY BE BZ BJ BT BO BA BW BR BN BG BF BI CV KH CM CA CF TD CL CN CO KM CG CD CR HR CU CY CZ DK DJ DM DO EC EG SV GQ ER EE SZ ET FJ FI FR GA GM GE DE GH GR GD GT GN GW GY HT HN HU IS IN ID IR IQ IE IL IT JM JP JO KZ KE KI KP KR KW KG LA LV LB LS LR LY LI LT LU MG MW MY MV ML MT MH MR MU MX FM MD MC MN ME MA MZ MM NA NR NP NL NZ NI NE NG MK NO OM PK PW PS PA PG PY PE PH PL PT QA RO RU RW KN LC VC WS SM ST SA SN RS SC SL SG SK SI SB SO ZA SS ES LK SD SR SE CH SY TW TJ TZ TH TL TG TO TT TN TR TM TV UG UA GB US UY UZ VU VA VE VN YE ZM ZW'.split(' ');
const regionNames = typeof Intl !== 'undefined' ? new Intl.DisplayNames(['en'], { type: 'region' }) : null;
const normalize = (value: string) => value.toLowerCase().replace(/\s+/g, '');
const countryCode = (country: string) => {
  const normalized = normalize(country);
  return countryCodes.find((code) => normalize(regionNames?.of(code) || '') === normalized) || 'US';
};

const defaultBilling = (): BillingInfo => ({
  firstName: sessionStorage.getItem('mName') || '',
  lastName: '',
  email: sessionStorage.getItem('email') || '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  country: ''
});

const requiredFields: Array<keyof BillingInfo> = ['firstName', 'lastName', 'email', 'address', 'city', 'state', 'zipCode', 'country'];

const PaymentDetails = () => {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const enabledMethods = methods.filter((method) => method.enabled);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(enabledMethods[0]?.id || 'paypal');
  const [billing, setBilling] = useState(defaultBilling);
  const [errors, setErrors] = useState<Partial<Record<keyof BillingInfo, string>>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const plan = planId && plans[planId as keyof typeof plans] ? plans[planId as keyof typeof plans] : { name: 'Unknown Plan', price: 0 };
  const included = useMemo(() => planFeatures.find((item) => item.name === plan.name)?.features || [], [plan.name]);
  const monthly = plan.name === MonthType;

  const setField = (field: keyof BillingInfo, value: string) => {
    setBilling((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
  };

  const validate = () => {
    const next: Partial<Record<keyof BillingInfo, string>> = {};
    requiredFields.forEach((field) => {
      if (!billing[field].trim()) next[field] = 'Required';
    });
    if (billing.email && !/^\S+@\S+\.\S+$/.test(billing.email)) next.email = 'Invalid email address';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const fail = (error: unknown) => {
    console.error(error);
    setIsProcessing(false);
    toast({ title: 'Error', description: 'Internal Server Error' });
  };

  const rememberPayment = (method: PaymentMethod) => {
    sessionStorage.setItem('method', method);
    sessionStorage.setItem('plan', plan.name);
  };

  const startStripe = async () => {
    const res = await api.post('/api/stripepayment', { planId: monthly ? stripePlanIdOne : stripePlanIdTwo, planName: plan.name });
    sessionStorage.setItem('stripe', res.data.id);
    rememberPayment('stripe');
    setIsProcessing(false);
    window.location.href = res.data.url;
  };

  const startPaystack = async () => {
    const res = await api.post('/api/paystackpayment', {
      planId: monthly ? paystackPlanIdOne : paystackPlanIdTwo,
      amountInZar: monthly ? amountInZarOne : amountInZarTwo
    });
    sessionStorage.setItem('paystack', res.data.id);
    rememberPayment('paystack');
    setIsProcessing(false);
    window.location.href = res.data.url;
  };

  const startRazorpay = async () => {
    const res = await api.post('/api/razorpaycreate', {
      plan: monthly ? razorpayPlanIdOne : razorpayPlanIdTwo,
      planName: plan.name,
      fullAddress: `${billing.address} ${billing.state} ${billing.zipCode} ${billing.country}`
    });
    rememberPayment('razorpay');
    setIsProcessing(false);
    window.open(res.data.short_url, '_blank');
    navigate('/payment-pending', { state: { sub: res.data.id, link: res.data.short_url, planName: plan.name, planCost: plan.price } });
  };

  const startPayPal = async () => {
    const res = await api.post('/api/paypal', {
      planId: monthly ? paypalPlanIdOne : paypalPlanIdTwo,
      planName: plan.name,
      name: billing.firstName,
      lastName: billing.lastName,
      post: billing.zipCode,
      address: billing.address,
      country: countryCode(billing.country),
      brand: companyName,
      admin: billing.state
    });
    rememberPayment('paypal');
    setIsProcessing(false);
    window.location.href = res.data.links?.find((link: { rel: string }) => link.rel === 'approve')?.href;
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    setIsProcessing(true);
    try {
      if (paymentMethod === 'stripe') await startStripe();
      else if (paymentMethod === 'paystack') await startPaystack();
      else if (paymentMethod === 'razorpay') await startRazorpay();
      else await startPayPal();
    } catch (error) {
      fail(error);
    }
  };

  const Field = ({ field, label, placeholder, type = 'text' }: { field: keyof BillingInfo; label: string; placeholder: string; type?: string }) => (
    <div className="space-y-2">
      <Label htmlFor={field}>{label}</Label>
      <Input id={field} type={type} placeholder={placeholder} value={billing[field]} onChange={(event) => setField(field, event.target.value)} />
      {errors[field] && <p className="text-sm font-medium text-destructive">{errors[field]}</p>}
    </div>
  );

  return (
    <div className="container max-w-5xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Complete Your Purchase</h1>
        <p className="text-muted-foreground">You're upgrading to the {plan.name}</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <form onSubmit={onSubmit} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="mr-2 h-5 w-5" />
                  Billing Information
                </CardTitle>
                <CardDescription>Please enter your billing information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field field="firstName" label="First Name" placeholder="John" />
                  <Field field="lastName" label="Last Name" placeholder="Doe" />
                </div>
                <Field field="email" label="Email" placeholder="john.doe@example.com" type="email" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="mr-2 h-5 w-5" />
                  Shipping Address
                </CardTitle>
                <CardDescription>Where should we send your receipt?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Field field="address" label="Address" placeholder="123 Main St" />
                <div className="grid grid-cols-2 gap-4">
                  <Field field="city" label="City" placeholder="San Francisco" />
                  <Field field="state" label="State/Province" placeholder="California" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field field="zipCode" label="ZIP/Postal Code" placeholder="94103" />
                  <Field field="country" label="Country" placeholder="United States" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="mr-2 h-5 w-5" />
                  Payment Method
                </CardTitle>
                <CardDescription>Select your preferred payment method</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)} className="w-full">
                  <TabsList className="grid grid-cols-5 mb-6">
                    {enabledMethods.map((method) => <TabsTrigger key={method.id} value={method.id}>{method.label}</TabsTrigger>)}
                  </TabsList>
                  {methods.map(({ id, icon: Icon, text, iconClass }) => (
                    <TabsContent key={id} value={id}>
                      <div className="flex flex-col items-center justify-center space-y-4 py-8">
                        <Icon className={`h-12 w-12 ${iconClass}`} />
                        <p className="text-center">{text}</p>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full bg-primary" disabled={isProcessing}>
                  {isProcessing ? 'Processing...' : `Pay $${plan.price}`}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>

        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="font-medium">{plan.name}</span>
                <span>${plan.price}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>${plan.price}</span>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg mt-6">
                <h4 className="font-medium mb-2">What's included:</h4>
                <ul className="space-y-2 text-sm">
                  {included.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaymentDetails;
