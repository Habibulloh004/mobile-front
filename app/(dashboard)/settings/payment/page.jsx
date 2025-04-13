"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { subscriptionAPI } from "@/lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function PaymentPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);
  const [formData, setFormData] = useState({
    amount: "",
    payment_method: "bank_transfer",
    transaction_id: "",
    notes: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);

  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch subscription information
        const subscriptionResponse =
          await subscriptionAPI.getSubscriptionInfo();
        setSubscriptionInfo(subscriptionResponse.data.data);

        // Set default amount based on monthly fee
        if (subscriptionResponse.data.data.monthly_fee) {
          setFormData((prev) => ({
            ...prev,
            amount: subscriptionResponse.data.data.monthly_fee.toString(),
          }));
        }

        // Fetch payment history
        const paymentsResponse = await subscriptionAPI.getAllPayments();
        setPaymentHistory(paymentsResponse.data.data || []);
      } catch (err) {
        console.error("Error fetching payment data:", err);
        setError("Failed to load payment information. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.role === "admin") {
      fetchPaymentData();
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Convert amount to number
      const paymentData = {
        ...formData,
        amount: parseFloat(formData.amount),
      };

      // Submit payment
      await subscriptionAPI.recordPayment(paymentData);

      setSuccess(
        "Payment recorded successfully. It will be reviewed by an administrator."
      );

      // Clear form
      setFormData({
        amount: subscriptionInfo?.monthly_fee?.toString() || "",
        payment_method: "bank_transfer",
        transaction_id: "",
        notes: "",
      });

      // Refresh payment history
      const paymentsResponse = await subscriptionAPI.getAllPayments();
      setPaymentHistory(paymentsResponse.data.data || []);
    } catch (err) {
      console.error("Error recording payment:", err);
      setError(
        err.response?.data?.message ||
          "Failed to record payment. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Redirect super admins or render empty state if needed
  if (user?.role === "superadmin") {
    return (
      <div className="max-w-4xl mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Payment</h1>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">
              Payment functionality is only available for food business admins.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Payment</h1>

      {/* Subscription info summary */}
      {subscriptionInfo && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Subscription Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Current Plan</p>
                <p className="font-medium">
                  {subscriptionInfo.current_tier?.name || "No active plan"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Monthly Fee</p>
                <p className="font-medium">
                  {formatCurrency(subscriptionInfo.monthly_fee || 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p
                  className={`font-medium ${
                    subscriptionInfo.subscription_status === "active"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {subscriptionInfo.subscription_status === "active"
                    ? "Active"
                    : "Expired"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <Card>
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>Make a Payment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <div className="p-3 rounded-md bg-red-50 text-red-500 text-sm">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="p-3 rounded-md bg-green-50 text-green-600 text-sm">
                    {success}
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="amount" className="text-sm font-medium">
                    Amount (USD) *
                  </label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={handleChange}
                    required
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="payment_method"
                    className="text-sm font-medium"
                  >
                    Payment Method *
                  </label>
                  <select
                    id="payment_method"
                    name="payment_method"
                    value={formData.payment_method}
                    onChange={handleChange}
                    required
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    disabled={isSaving}
                  >
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="paypal">PayPal</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="transaction_id"
                    className="text-sm font-medium"
                  >
                    Transaction ID
                  </label>
                  <Input
                    id="transaction_id"
                    name="transaction_id"
                    value={formData.transaction_id}
                    onChange={handleChange}
                    placeholder="Enter transaction reference number"
                    disabled={isSaving}
                  />
                  <p className="text-xs text-gray-500">
                    If you have a reference number for your payment, please
                    enter it here.
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="notes" className="text-sm font-medium">
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Additional details about your payment"
                    className="w-full min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    disabled={isSaving}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Processing..." : "Submit Payment"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>

        {/* Payment History */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              {paymentHistory.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-500">No payment history available.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {paymentHistory.map((payment) => (
                    <div
                      key={payment.id}
                      className="border-b pb-4 last:border-b-0 last:pb-0"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <p className="font-medium">
                            {formatCurrency(payment.amount)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(payment.payment_date)}
                          </p>
                        </div>
                        <div>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              payment.status === "verified"
                                ? "bg-green-100 text-green-600"
                                : payment.status === "rejected"
                                ? "bg-red-100 text-red-600"
                                : "bg-yellow-100 text-yellow-600"
                            }`}
                          >
                            {payment.status === "verified"
                              ? "Verified"
                              : payment.status === "rejected"
                              ? "Rejected"
                              : "Pending"}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                        <div>
                          <span className="font-medium">Method:</span>{" "}
                          {payment.payment_method}
                        </div>
                        {payment.transaction_id && (
                          <div>
                            <span className="font-medium">Ref:</span>{" "}
                            {payment.transaction_id}
                          </div>
                        )}
                      </div>
                      {payment.notes && (
                        <p className="mt-2 text-xs text-gray-600">
                          {payment.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
