// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Download, ArrowRight, Receipt } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { companyName, MonthCost, websiteURL, YearCost } from '@/constants';
import { emailTemplate, paragraph } from '@/lib/email';
import api from '@/lib/api';

const PaymentSuccess = () => {

  const { planId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [receiptId, setReceiptId] = useState('');
  const [planName, setPlanName] = useState('');
  const [method, setMethod] = useState('');
  const [cost, setCost] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleDownload = () => {
    // Replace PDF generation with browser-native print functionality
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Receipt - ${receiptId}</title>
            <style>
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                padding: 20px; 
                max-width: 600px; 
                margin: 0 auto;
              }
              .header { 
                text-align: center; 
                margin-bottom: 30px; 
              }
              .details { 
                margin: 20px 0; 
              }
              .row { 
                display: flex; 
                justify-content: space-between; 
                margin: 10px 0; 
              }
              .separator { 
                border-top: 1px solid #eee; 
                margin: 20px 0; 
              }
              .footer { 
                text-align: center; 
                margin-top: 30px; 
                font-size: 12px; 
                color: #666; 
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Payment Receipt</h1>
              <p><strong>Receipt ID:</strong> ${receiptId}</p>
              <p><strong>Date:</strong> ${getCurrentDate()}</p>
            </div>
            
            <div class="details">
              <h3>Plan Details</h3>
              <div class="row">
                <span>${planName}</span>
                <span><strong>$${cost}</strong></span>
              </div>
              <div class="row">
                <span>Payment Method:</span>
                <span>${method}</span>
              </div>
            </div>
            
            <div class="separator"></div>
            
            <div class="details">
              <h3>Billing Details</h3>
              <div class="row">
                <span>Name:</span>
                <span>${name}</span>
              </div>
              <div class="row">
                <span>Email:</span>
                <span>${email}</span>
              </div>
            </div>
            
            <div class="footer">
              <p>Thank you for your purchase!</p>
              <p>${companyName}</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
    toast({
      title: "Receipt Downloaded",
      description: "Your receipt has been downloaded successfully.",
    });
  };

  useEffect(() => {
    getDetails();
  }, []);

  async function getDetails() {

    setReceiptId(planId);
    setPlanName(sessionStorage.getItem('plan'));
    setCost(sessionStorage.getItem('plan') === 'Monthly Plan' ? '' + MonthCost : '' + YearCost);
    setName(sessionStorage.getItem('mName'));
    setEmail(sessionStorage.getItem('email'));
    setMethod(sessionStorage.getItem('method'));

    if (sessionStorage.getItem('method') === 'stripe') {
      const dataToSend = {
        subscriberId: sessionStorage.getItem('stripe'),
        plan: sessionStorage.getItem('plan')
      };
      const postURL = '/api/stripedetails';
      await api.post(postURL, dataToSend).then(res => {
        sessionStorage.setItem('type', sessionStorage.getItem('plan'));
        sendEmail();
      });
    } else if (sessionStorage.getItem('method') === 'paystack') {
      const dataToSend = {
        plan: sessionStorage.getItem('plan')
      };
      const postURL = '/api/paystackfetch';
      await api.post(postURL, dataToSend).then(res => {
        sessionStorage.setItem('type', sessionStorage.getItem('plan'));
        sendEmail();
      });
    } else if (sessionStorage.getItem('method') === 'flutterwave') {
      const dataToSend = {
        plan: sessionStorage.getItem('plan')
      };
      const postURL = '/api/flutterdetails';
      await api.post(postURL, dataToSend).then(res => {
        sessionStorage.setItem('type', sessionStorage.getItem('plan'));
        sendEmail();
      });
    } else {
      const subscriptionId = planId;
      const dataToSend = {
        subscriberId: subscriptionId,
        plan: sessionStorage.getItem('plan')
      };
      try {
        if (sessionStorage.getItem('method') === 'paypal') {
          const postURL = '/api/paypaldetails';
          await api.post(postURL, dataToSend).then(res => {
            sessionStorage.setItem('type', sessionStorage.getItem('plan'));
            sendEmail();
          });
        } else if (sessionStorage.getItem('method') === 'razorpay') {
          const postURL = '/api/razorapydetails';
          await api.post(postURL, dataToSend).then(res => {
            sessionStorage.setItem('type', sessionStorage.getItem('plan'));
            sendEmail();
          });
        }
      } catch (error) {
        console.error(error);
        toast({
          title: "Error",
          description: "Internal Server Error",
        });
      }
    }

  }

  const getCurrentDate = () => {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0'); // Pad single digit days with a leading 0
    const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() is zero-indexed, so we add 1
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  async function sendEmail() {
    const html = emailTemplate({
      title: 'Payment Successful',
      preview: 'Payment Successful',
      body: paragraph('Your payment was successful, and your account ' + email + ' has been upgraded to the ' + planName + '.'),
      buttonHref: websiteURL + '/login',
      buttonText: 'SignIn',
    });

    try {
      const plan = sessionStorage.getItem('plan');
      const subscription = planId;
      const subscriberId = sessionStorage.getItem('email');
      const method = sessionStorage.getItem('method');
      await api.post('/api/sendreceipt', { html, plan, subscriberId, method, subscription });
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div id="content-id" className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-12 px-4 sm:px-6 flex flex-col items-center justify-center">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="text-center border-b pb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Payment Successful!</CardTitle>
          <p className="text-muted-foreground mt-2">
            Your payment has been successfully processed.
          </p>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Receipt</p>
                <p className="font-medium">{receiptId}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-medium">{getCurrentDate()}</p>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-medium mb-2">Plan Details</h3>
              <div className="flex justify-between items-center mb-1">
                <p>{planName}</p>
                <p className="font-bold">${cost}</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Payment Method: {method}
              </p>
            </div>

            <Separator />

            <div>
              <h3 className="font-medium mb-2">Billing Details</h3>
              <p className="mb-1">{name}</p>
              <p className="text-sm text-muted-foreground">{email}</p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row justify-between gap-4 pt-4 border-t">
          <Button variant="outline" onClick={handleDownload}>
            <Receipt className="mr-2 h-4 w-4" />
            Download Receipt
          </Button>

          <Button onClick={() => navigate('/dashboard')}>
            Go to Dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
