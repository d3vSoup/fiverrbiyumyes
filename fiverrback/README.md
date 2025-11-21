# fiverrback

Express + JSON file backend for “Fiverr for Students”.

## Features

- Validates BMSCE/BMSCA/BMSCL email domains (plus admin mailbox)
- Seeds CAD/MATH/UI/Project services in INR
- Persists users, services, carts, wishlists, and orders to `src/db.json`
- Admin overview endpoints for orders + host/student inventory

## Endpoints

| Method | Endpoint              | Notes                                             |
|--------|----------------------|---------------------------------------------------|
| POST   | `/auth/login`        | `{ email, name }` → validates domain              |
| GET    | `/services`          | List all services                                 |
| POST   | `/services`          | Host creates service (BMS domains only)           |
| GET    | `/cart?userEmail=`   | Cart items (with service payload)                 |
| POST   | `/cart`              | `{ userEmail, serviceId, quantity }`              |
| DELETE | `/cart/:id`          | Remove cart entry                                 |
| GET    | `/wishlist?userEmail=`| Wishlist items                                   |
| POST   | `/wishlist`          | Toggle wishlist entry                             |
| DELETE | `/wishlist/:id`      | Remove wishlist entry                             |
| POST   | `/orders`            | Checkout (moves cart → orders)                    |
| GET    | `/orders`            | Admin sees all; students see own orders           |
| GET    | `/admin/inventory`   | Admin snapshot (`x-admin-email` header required)  |

## Run locally

```bash
cd fiverrback
npm install
npm run dev  # http://localhost:4000
```

Data lives in `src/db.json`; delete it to reseed with defaults.

