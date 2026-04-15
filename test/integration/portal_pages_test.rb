require "test_helper"

class PortalPagesTest < ActionDispatch::IntegrationTest
  test "core portal pages render" do
    host! "narmypayroll.gitgar.com"

    ["/", "/login", "/onboard", "/setup", "/dashboard", "/help", "/pay", "/complaints", "/admin/dashboard", "/admin/payroll/upload"].each do |path|
      get path
      assert_response :success, "expected #{path} to render successfully"
      assert_includes response.body, '<div id="app"></div>'
    end
  end
end
