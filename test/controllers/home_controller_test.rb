require "test_helper"

class HomeControllerTest < ActionDispatch::IntegrationTest
  test "renders the portal landing page" do
    get root_url

    assert_response :success
    assert_match "NARMY Portal v1", response.body
  end
end
