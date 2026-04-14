require "test_helper"

class HomeControllerTest < ActionDispatch::IntegrationTest
  test "renders the portal landing page" do
    host! "payroll.narmy.gitgar.com"
    get "/"

    assert_response :success
    assert_match "Army Finance Payroll", response.body
  end
end
