require "test_helper"

class FrontendControllerTest < ActionDispatch::IntegrationTest
  test "renders the react shell on the landing page" do
    host! "narmypayroll.gitgar.com"
    get "/"

    assert_response :success
    assert_includes response.body, '<div id="app"></div>'
    assert_includes response.body, "Army Finance Payroll"
  end
end
