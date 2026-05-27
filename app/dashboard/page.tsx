import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Microscope, ShieldCheck, Factory, Plus } from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your NutraCloud workspace",
};

export default async function DashboardPage() {
  return (
    <div className="bg-gray-50 py-12 px-5">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-10">
          <p className="eyebrow mb-3">Workspace</p>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Your Formulations</h1>
              <p className="mt-2 text-sm text-gray-500">
                Manage your supplement formulation projects
              </p>
            </div>
            <Link
              href="/dashboard/new"
              className="flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-brand-dark"
            >
              <Plus className="size-4" />
              New formulation
            </Link>
          </div>
        </div>

        {/* Quick actions */}
        <div className="mb-10 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="inline-flex size-10 items-center justify-center rounded-full bg-brand-50 text-brand">
              <Microscope className="size-5" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-gray-900">Research</h2>
            <p className="mt-2 text-sm text-gray-500">
              Search clinical studies and build evidence-based formulations
            </p>
            <Link
              href="/dashboard/research"
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand hover:underline"
            >
              Start researching <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="inline-flex size-10 items-center justify-center rounded-full bg-green-50 text-green-600">
              <ShieldCheck className="size-5" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-gray-900">Compliance</h2>
            <p className="mt-2 text-sm text-gray-500">
              Review claims and ensure FDA compliance before launch
            </p>
            <Link
              href="/dashboard/compliance"
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand hover:underline"
            >
              Review compliance <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="inline-flex size-10 items-center justify-center rounded-full bg-purple-50 text-purple-600">
              <Factory className="size-5" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-gray-900">Manufacturing</h2>
            <p className="mt-2 text-sm text-gray-500">
              Connect with manufacturers and manage RFQs
            </p>
            <Link
              href="/dashboard/manufacturers"
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand hover:underline"
            >
              Find manufacturers <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>

        {/* Recent formulations */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Formulations</h2>
          </div>
          <div className="p-12 text-center">
            <div className="mx-auto size-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Microscope className="size-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No formulations yet</h3>
            <p className="mt-2 text-sm text-gray-500">
              Create your first formulation to start building evidence-backed supplements
            </p>
            <Link
              href="/dashboard/new"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-brand-dark"
            >
              <Plus className="size-4" />
              Create formulation
            </Link>
          </div>
        </div>

        {/* Coming soon banner */}
        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <p className="text-sm font-medium text-amber-800">
            🚧 The full platform is coming soon. RAG-powered research, compliance checking, and manufacturer connections are in development.
          </p>
        </div>
      </div>
    </div>
  );
}