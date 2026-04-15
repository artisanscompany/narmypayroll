import { createFileRoute, Link } from '@tanstack/react-router'
import { ComplaintForm } from '#/components/complaint-form'
import { ArrowLeft } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/_personnel/complaints/new')({
  component: NewComplaintPage,
})

function NewComplaintPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <Link to="/complaints" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-army transition-colors mb-5">
        <ArrowLeft className="w-3.5 h-3.5" />
        All inquiries
      </Link>
      <ComplaintForm />
    </div>
  )
}
