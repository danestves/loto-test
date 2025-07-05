import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CreditCard, Tag, TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  const healthCheck = useQuery(orpc.healthCheck.queryOptions());

  return (
    <div className="container mx-auto space-y-8 px-4 py-8">
      <div className="text-center">
        <h1 className="mb-4 font-bold text-4xl">Corporate Card Transaction Manager</h1>
        <p className="text-muted-foreground text-xl">
          Track, categorize, and analyze your corporate card expenses
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Transactions
            </CardTitle>
            <CardDescription>
              Record and manage corporate card transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="mb-6 space-y-2 text-sm">
              <li>• Track card expenses</li>
              <li>• Filter by status & date</li>
              <li>• Approve or reject pending</li>
            </ul>
            <Link to="/transactions">
              <Button className="w-full">
                Manage Transactions
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Categories
            </CardTitle>
            <CardDescription>
              Organize expenses by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="mb-6 space-y-2 text-sm">
              <li>• Create expense categories</li>
              <li>• Unique category names</li>
              <li>• Easy organization</li>
            </ul>
            <Link to="/categories">
              <Button className="w-full">
                Manage Categories
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Analytics
            </CardTitle>
            <CardDescription>
              View expense summaries and insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="mb-6 space-y-2 text-sm">
              <li>• Summary by category</li>
              <li>• Total expenses</li>
              <li>• Transaction counts</li>
            </ul>
            <Link to="/transactions">
              <Button className="w-full">
                View Analytics
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-6">
          <CardTitle>System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div
              className={`h-3 w-3 rounded-full ${healthCheck.data ? "bg-green-500" : "bg-red-500"}`}
            />
            <span className="text-sm">
              API Status: {" "}
              <span className="font-medium">
                {healthCheck.isLoading
                  ? "Checking..."
                  : healthCheck.data
                    ? "Online"
                    : "Offline"}
              </span>
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
