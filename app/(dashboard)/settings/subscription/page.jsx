"use client";

import { useState, useEffect } from "react";
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
import { formatCurrency, formatDate } from "@/lib/utils";
import { CheckCircle, AlertCircle, Clock } from "lucide-react";

export default function SubscriptionPage() {
  const { user } = useAuthStore();
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);
  const [tiers, setTiers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubscriptionData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch subscription information
        const subscriptionResponse =
          await subscriptionAPI.getSubscriptionInfo();
        setSubscriptionInfo(subscriptionResponse.data.data);

        // Fetch available subscription tiers
        const tiersResponse = await subscriptionAPI.getAllTiers();
        setTiers(tiersResponse.data.data || []);
      } catch (err) {
        console.error("Error fetching subscription data:", err);
        setError("Failed to load subscription information. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.role === "admin") {
      fetchSubscriptionData();
    }
  }, [user]);

  // Redirect super admins or render empty state if needed
  if (user?.role === "superadmin") {
    return (
      <div className="max-w-4xl mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Subscription Management</h1>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">
              Subscription management is only available for food business
              admins.
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

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Subscription Management</h1>
        <div className="text-center py-6">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  // Helper function to display status icon
  const StatusIcon = ({ status }) => {
    if (status === "active") {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else if (status === "expired") {
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    } else {
      return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Subscription Management</h1>

      {/* Current Subscription */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Current Subscription</CardTitle>
        </CardHeader>
        <CardContent>
          {subscriptionInfo ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b">
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <div className="flex items-center mt-1">
                    <StatusIcon status={subscriptionInfo.subscription_status} />
                    <span className="ml-2 font-medium">
                      {subscriptionInfo.subscription_status === "active"
                        ? "Active"
                        : subscriptionInfo.subscription_status === "expired"
                        ? "Expired"
                        : "Pending"}
                    </span>
                  </div>
                </div>

                {subscriptionInfo.current_tier && (
                  <div>
                    <p className="text-sm text-gray-500">Current Plan</p>
                    <p className="font-medium mt-1">
                      {subscriptionInfo.current_tier.name}
                    </p>
                  </div>
                )}

                {subscriptionInfo.subscription_expires_at && (
                  <div>
                    <p className="text-sm text-gray-500">Expires On</p>
                    <p className="font-medium mt-1">
                      {formatDate(subscriptionInfo.subscription_expires_at)}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-500">Monthly Fee</p>
                  <p className="font-medium mt-1">
                    {formatCurrency(subscriptionInfo.monthly_fee || 0)}
                  </p>
                </div>
              </div>

              {/* User count */}
              <div>
                <p className="text-sm text-gray-500 mb-1">
                  Current Active Users
                </p>
                <p className="font-medium">
                  {subscriptionInfo.admin?.users || 0} users
                </p>
              </div>

              {/* Access restriction warning */}
              {subscriptionInfo.is_access_restricted && (
                <div className="p-4 bg-red-50 text-red-700 rounded-md">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    <div>
                      <p className="font-medium">Access Restricted</p>
                      <p className="text-sm mt-1">
                        Your access is currently restricted due to an expired
                        subscription. Please make a payment to restore full
                        access to the service.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Recommended tier */}
              {subscriptionInfo.recommended_tier && (
                <div className="p-4 bg-blue-50 text-blue-700 rounded-md">
                  <div className="flex">
                    <div>
                      <p className="font-medium">Recommended Plan</p>
                      <p className="text-sm mt-1">
                        Based on your user count, we recommend upgrading to the{" "}
                        <strong>
                          {subscriptionInfo.recommended_tier.name}
                        </strong>{" "}
                        plan (
                        {formatCurrency(
                          subscriptionInfo.recommended_tier.price
                        )}
                        /month).
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500">
                No subscription information available.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={() => (window.location.href = "/settings/payment")}>
            Make a Payment
          </Button>
        </CardFooter>
      </Card>

      {/* Available Plans */}
      <h2 className="text-xl font-semibold mb-4">Available Plans</h2>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {tiers.map((tier) => (
          <Card
            key={tier.id}
            className={
              tier.id === subscriptionInfo?.current_tier?.id
                ? "border-2 border-primary"
                : ""
            }
          >
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{tier.name}</span>
                {tier.id === subscriptionInfo?.current_tier?.id && (
                  <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                    Current
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold mb-4">
                {formatCurrency(tier.price)}
                <span className="text-sm font-normal text-gray-500">
                  /month
                </span>
              </p>

              <div className="text-sm text-gray-500 mb-4">
                <p>
                  For {tier.min_users} -{" "}
                  {tier.max_users ? tier.max_users : "unlimited"} users
                </p>
              </div>

              <p className="text-sm">{tier.description}</p>
            </CardContent>
            <CardFooter>
              <Button
                variant={
                  tier.id === subscriptionInfo?.current_tier?.id
                    ? "outline"
                    : "default"
                }
                className="w-full"
                onClick={() => (window.location.href = "/settings/payment")}
              >
                {tier.id === subscriptionInfo?.current_tier?.id
                  ? "Current Plan"
                  : "Select Plan"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
