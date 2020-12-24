# Strapi application
> npx create-strapi-app project-name --quickstart
> yarn add strapi-plugin-magic

Frontend Bulit with
* Magic [docs](https://magic.link/)
* NextJs

# yarn add strapi-plugin-magic
In strapi admin dashboard
1. magic (sidebar) - sercet key (copy from magic dashboard)
2. it will added magic into strapi

# Added new folder after paste in magic key
> extensions/user-permissions/config/policies/permissions.js
1. added policies folder and file
2. copy permission from github strapi [link](https://github.com/strapi/strapi/blob/master/packages/strapi-plugin-users-permissions/config/policies/permissions.js)
3. add below line in line 5
```javascript
await strapi.plugins["magic"].services["magic"].loginWithMagic(ctx);
```

# After added order from strapi admin
> /api/order/controllers/order.js
order controller, let user only retrieve their order record only.

# Create Post order JSON TEST

```JSON
{
	"product": {"id": 1}
}
```

# Added new routes in backend routes.json
```JSON
{
  "method": "POST",
  "path": "/orders/confirm",
  "handler": "order.confirm",
  "config": {
    "policies": []
  }
},
```

# Confirm order API
```JSON
{
	"checkout_session": "cs_test_a1DHvLVvRUl050e0NW0NDaKiORx0XwVgbqDQKmHaBxc4AtBTXq4Cr9tHfO"
}
```



How i started from:
1. Install strapi for backend
2. Create Product Collection (name will automatically plural)
3. Create Product item
4. Settings - Users && Permission plguin - identity - public (checked: find && findOne)
5. Install NextJs for frontend
6. Create utils urls(paste: Magic TEST key as default) and format
7. Install magic-sdk (which helps authorization to frontend)
8. Create useAuth Context
9. Create checkUserLoggedIn function when refresh re-login again
10. Yarn add strapi-plugin-magic (Making authenticated requests to Strapi)
11. Kill server and restart
12. Copy magic secret key to store in strapi Admin
13. Added folder for permissions
14. Added one line code in line 5 (check top details)
15. Test Api with JWT token - http://localhost:1337/products
16. After Test with Auth user, auth user will be added into User Collection.
17. Create Order Collection
18. Setting Relation, Product has many Orders
19. Setting Relation, User has many Orders
20. Testing doing manully add order, checkout_session: randomString, User(Select user), Product (Select Product)
21. Settings - Users && Permission plguin - identity - authenticated (checked: find && findOne)
22. Test Api with JWT token - http://localhost:1337/orders
23. Get all orders event not belongs to the user
24. Edit backend/api/order/controllers/orders.js (to let user only can retrieve what order belongs to him)
25. Create useOrders custom hook in account.
26. Fetch orders with authentication bearer token, which like Test Api in orders
27. Listing Order item in account page.
28. Seting loading state for  orders
29. Yarn add stripe in backend
30. Enter stripe web - login - Developers - API keys - secret keys
31. ADD secret key in backend .env
32. Go To order Controller, require stripe and key and order create function, create function return id of sesiion ready use for frontend
31. Settings - Users && Permission plguin - identity - authenticated (checked: create)
32. Test Api with JWT Token -  Body(JSON),  - http://localhost:1337/orders
33. Strapi Admin will added one order with unpaid
34. yarn add @stripe/stripe-js (install frontend stripe sdk) in frontend
35. Added TEST key from stripe in utils/url.
36. Create component BuyButton, and integate with stripe sdk.
37. Test Buy feature, It succefull and redirect back, but it still is unpaid in strapi order collection.
38. Go to Backend controllers/order.js, add confirm function.
39. Need to added this confirm into our routes
40. backend/api/order/config/routes.json
41. Go To Strapi Admin - Settings - identity - public (checked: order's confirm)
42. Test Api with JWT Token - Body(JSON) - http://localhost:1337/orders/confirm
43. Successful (success_url, order controller, hit confirm function) - Strapi Order unpaid updated to paid
44. Yarn add strapi-provider-upload-aws-s3 in backend for upload image to cloud
45. create ./config/plugins.js [docs](https://strapi.io/documentation/developer-docs/latest/plugins/upload.html#using-a-provider)
46. Go to aws s3 - create bucket
47. Copy bucket name into plguins.js and *region ap-southeast-1*
48. Uncheck *Block all public access*, then it able to file upload
49. Click top bar name - security credentials - create access keys
50. access key id and secret
