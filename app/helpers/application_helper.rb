module ApplicationHelper
  def portal_navigation
    [
      [ "Overview", root_path ],
      [ "Login", login_path ],
      [ "Onboarding", onboarding_path ],
      [ "Admin", admin_dashboard_path ],
      [ "Personnel", personnel_dashboard_path ],
      [ "Profile", profile_path ],
      [ "Complaints", complaints_path ],
      [ "Payroll", payroll_path ]
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
