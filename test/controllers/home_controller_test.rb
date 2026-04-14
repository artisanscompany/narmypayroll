require "test_helper"

class HomeControllerTest < ActionDispatch::IntegrationTest
  test "renders the portal landing page" do
    host! "localhost"
    get "/"

    assert_response :success
    assert_match "NARMY Portal V1", response.body
  end
end
