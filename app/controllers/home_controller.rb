class HomeController < ApplicationController
  ServiceStatus = Struct.new(:label, :state, :detail, keyword_init: true)

  def index
    @readiness_metrics = [
      { value: "277k+", label: "Personnel and staff accounts" },
      { value: "30k", label: "Peak concurrent sessions" },
      { value: "<200ms", label: "Target p95 response" }
    ]

    @service_statuses = [
      postgres_status,
      redis_status
    ]

    @notes = [
      {
        title: "Mission scope",
        copy: "Personnel records, payroll processing, complaint handling, AWOL workflows, analytics, e-learning, and administrative operations under a single command surface."
      },
      {
        title: "Deployment shape",
        copy: "Application runtime on the app node, PostgreSQL on the dedicated data node, Redis local to the app tier, and HTTPS routing through Coolify."
      },
      {
        title: "Ready for the next layer",
        copy: "The platform is now wired for environment-driven configuration so authentication, mail delivery, and core business flows can be added without reworking the topology."
      }
    ]
  end

  private

  def postgres_status
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
    ping = Redis.new(url: ENV.fetch("REDIS_URL"), connect_timeout: 1, read_timeout: 1, write_timeout: 1).ping

    ServiceStatus.new(
      label: "Redis",
      state: ping == "PONG" ? "connected" : "unavailable",
      detail: ping
    )
  rescue StandardError => error
    ServiceStatus.new(
      label: "Redis",
      state: "unavailable",
      detail: error.message
    )
  end
end
