import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { MaintainerDashboard } from "./MaintainerDashboard";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm h-16 flex justify-between items-center border-b shadow-sm px-4">
        <h2 className="text-xl font-semibold text-primary">Maintainer Availability</h2>
        <SignOutButton />
      </header>
      <main className="flex-1 p-8">
        <Content />
      </main>
      <Toaster />
    </div>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <Authenticated>
        <MaintainerDashboard />
      </Authenticated>
      <Unauthenticated>
        <div className="flex flex-col items-center gap-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-primary mb-4">Maintainer Availability System</h1>
            <p className="text-xl text-secondary">Sign in to manage maintainer availability</p>
          </div>
          <SignInForm />
        </div>
      </Unauthenticated>
    </div>
  );
}
