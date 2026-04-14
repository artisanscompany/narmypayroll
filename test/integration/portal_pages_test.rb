require "test_helper"

class PortalPagesTest < ActionDispatch::IntegrationTest
  test "core portal pages render" do
    host! "payroll.narmy.gitgar.com"

    get root_path
    assert_response :success
    assert_includes @response.body, "Army Finance Payroll"

    get login_path
    assert_response :success

    get onboarding_path
    assert_response :success

    get admin_dashboard_path
    assert_response :success

    get personnel_dashboard_path
    assert_response :success

    get profile_path
    assert_response :success

    get complaints_path
    assert_response :success

    get payroll_path
    assert_response :success
  end
end
