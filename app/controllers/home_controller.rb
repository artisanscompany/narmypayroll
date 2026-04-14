class HomeController < ApplicationController
  ServiceStatus = Struct.new(:label, :state, :detail, keyword_init: true)
  before_action :set_portal_content

  def index
    @service_statuses = [
      postgres_status,
      redis_status
    ]
  end

  def login
    @demo_accounts = [
      { rank: "Capt.", name: "Adeyemi", role: "Personnel", army_number: "NA/23/01234" },
      { rank: "Pvt.", name: "Musa", role: "First login", army_number: "NA/15/05678" },
      { rank: "Maj.", name: "Okonkwo", role: "Division Admin", army_number: "DA/10/00456" },
      { rank: "Col.", name: "Nwachukwu", role: "Super Admin", army_number: "SA/05/00123" }
    ]
  end

  def onboarding
    @onboarding_steps = [
      "Validate Army Number and temporary password",
      "Create a permanent password and 4-digit document PIN",
      "Review service data and activate the self-service profile"
    ]
  end

  def admin_dashboard
    @service_statuses = [ postgres_status, redis_status ]
  end

  def personnel_dashboard
    @service_statuses = [ postgres_status, redis_status ]
  end

  def profile; end

  def complaints; end

  def payroll; end

  private

  def set_portal_content
    @readiness_metrics = [
      { value: "277k+", label: "Personnel and staff accounts" },
      { value: "30k", label: "Peak concurrent sessions" },
      { value: "<200ms", label: "Target p95 response" }
    ]
    @platform_modules = [
      "Payslip management",
      "Complaint handling",
      "Personnel records",
      "Admin analytics",
      "Role-based access",
      "PIN-protected documents",
      "AWOL workflows",
      "Self-service profile"
    ]
    @delivery_track = [
      {
        title: "Infrastructure online",
        detail: "Coolify deploy target, PostgreSQL service, Redis service, TLS, and custom domain are prepared for the first production release."
      },
      {
        title: "Portal scaffold",
        detail: "This Rails app mirrors the prototype's key surfaces so product work can move from static mockups into deployable pages."
      },
      {
        title: "Operational integration",
        detail: "The runtime is wired for DATABASE_URL, REDIS_URL, HTTPS mailer hosts, and stateless cache usage in production."
      }
    ]
    @admin_metrics = [
      { label: "Open tickets", value: "184", trend: "+12%" },
      { label: "Monthly payroll run", value: "277k", trend: "Ready" },
      { label: "SLA compliance", value: "96.4%", trend: "+1.8%" },
      { label: "Divisions covered", value: "6", trend: "Nationwide" }
    ]
    @personnel_metrics = [
      { label: "Net pay", value: "NGN 438,500", note: "March 2026" },
      { label: "Open inquiries", value: "2", note: "1 near SLA" },
      { label: "Profile status", value: "Verified", note: "PIN enrolled" },
      { label: "Service years", value: "14y 3m", note: "Signals Corps" }
    ]
    @support_channels = [
      { label: "Division pay office", detail: "For onboarding and payroll disputes" },
      { label: "Personnel help desk", detail: "For profile and document issues" },
      { label: "Admin operations team", detail: "For tickets, RBAC, and data uploads" }
    ]
    @complaint_rows = [
      { id: "CMP-2401", title: "Housing allowance variance", status: "under review", filed_on: "11 Apr 2026", sla: "2d left", owner: "Division 1" },
      { id: "CMP-2387", title: "Missing tax certificate", status: "resolved", filed_on: "7 Apr 2026", sla: "closed", owner: "HQ Payroll" },
      { id: "CMP-2354", title: "Corps assignment mismatch", status: "new", filed_on: "4 Apr 2026", sla: "4d left", owner: "Records Unit" }
    ]
    @payroll_breakdown = [
      { label: "Basic salary", amount: "NGN 280,000" },
      { label: "Transport allowance", amount: "NGN 48,000" },
      { label: "Housing allowance", amount: "NGN 65,000" },
      { label: "Pension deduction", amount: "-NGN 22,400" },
      { label: "PAYE", amount: "-NGN 16,100" },
      { label: "Net pay", amount: "NGN 438,500" }
    ]
    @profile_sections = [
      { label: "Army number", value: "NA/23/01234" },
      { label: "Rank", value: "Captain" },
      { label: "Division", value: "1 Division, Kaduna" },
      { label: "Corps", value: "Signals" },
      { label: "Date of enlistment", value: "16 January 2012" },
      { label: "Document PIN", value: "Configured" }
    ]
  end

  def postgres_status
    return pending_status("PostgreSQL", "Production runtime check activates once DATABASE_URL is present.") unless Rails.env.production? && ENV["DATABASE_URL"].present?

    database_name = ActiveRecord::Base.connection.select_value("select current_database()")

    ServiceStatus.new(
      label: "PostgreSQL",
      state: "connected",
      detail: database_name
    )
  rescue StandardError => error
    ServiceStatus.new(
      label: "PostgreSQL",
      state: "unavailable",
      detail: error.message
    )
  end

  def redis_status
    return pending_status("Redis", "Production runtime check activates once REDIS_URL is present.") unless Rails.env.production? && ENV["REDIS_URL"].present?

    cache_stamp = Rails.cache.fetch("narmy-portal-v1:status", expires_in: 10.minutes) { Time.current.iso8601 }
    ping = Redis.new(url: ENV.fetch("REDIS_URL"), connect_timeout: 1, read_timeout: 1, write_timeout: 1).ping

    ServiceStatus.new(
      label: "Redis",
      state: ping == "PONG" ? "connected" : "unavailable",
      detail: "#{ping} · cache warmed at #{cache_stamp}"
    )
  rescue StandardError => error
    ServiceStatus.new(
      label: "Redis",
      state: "unavailable",
      detail: error.message
    )
  end

  def pending_status(label, detail)
    ServiceStatus.new(label:, state: "pending", detail:)
  end
end
