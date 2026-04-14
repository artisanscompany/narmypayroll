module ApplicationHelper
  def payroll_host
    ENV.fetch("PAYROLL_HOST", ENV.fetch("APP_HOST", "narmypayroll.gitgar.com"))
  end

  def website_host
    ENV.fetch("WEBSITE_HOST", "narmysite.gitgar.com")
  end

  def payroll_base_url(path = "/")
    "https://#{payroll_host}#{path}"
  end

  def website_base_url(path = "/")
    "https://#{website_host}#{path}"
  end

  def portal_navigation
    [
      [ "Overview", root_path ],
      [ "Secure Access", login_path ],
      [ "Onboarding", onboarding_path ],
      [ "Admin Console", admin_dashboard_path ],
      [ "Personnel Home", personnel_dashboard_path ],
      [ "Profile", profile_path ],
      [ "Inquiries", complaints_path ],
      [ "Pay & Docs", payroll_path ]
    ]
  end

  def portal_nav_link(label, path)
    classes = [ "site-nav__link" ]
    classes << "site-nav__link--active" if current_page?(path)
    link_to label, path, class: classes.join(" ")
  end

  def status_pill_class(value)
    case value.to_s
    when "connected", "resolved"
      "status-pill status-pill--ok"
    when "under review", "new"
      "status-pill status-pill--warn"
    when "unavailable"
      "status-pill status-pill--error"
    when "pending"
      "status-pill status-pill--pending"
    else
      "status-pill"
    end
  end
end
