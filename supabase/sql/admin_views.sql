-- ============================================================
-- Supabase helper views for admin dashboards (manage orders /
-- manage items). Copy these into Supabase SQL editor after
-- running schema.sql so the React app can query them easily.
-- ============================================================

-- admin_orders view flattens orders with all details.
create or replace view admin_orders as
select
  o.id as order_id,
  o.buyer_email,
  o.buyer_name,
  o.host_email,
  o.host_name,
  o.service_id,
  o.listing_title,
  o.listing_description,
  o.portfolio_link,
  o.message,
  o.status,
  o.total_in_inr,
  o.placed_at,
  o.created_at,
  o.last_activity,
  json_agg(
    json_build_object(
      'service_id', oi.service_id,
      'title', oi.service_id,
      'quantity', oi.quantity,
      'unit_price', oi.unit_price
    )
  ) as items
from orders o
left join order_items oi on oi.order_id = o.id
group by o.id, o.buyer_email, o.buyer_name, o.host_email, o.host_name, 
         o.service_id, o.listing_title, o.listing_description, 
         o.portfolio_link, o.message, o.status, o.total_in_inr, 
         o.placed_at, o.created_at, o.last_activity;

-- admin_host_items view shows every host and their services.
create or replace view admin_host_items as
select
  s.host_email,
  u.name as host_name,
  u.phone_number,
  u.usn,
  u.semester,
  json_agg(
    json_build_object(
      'service_id', s.id,
      'title', s.title,
      'category', s.category,
      'price_in_inr', s.price_in_inr,
      'price_min', s.price_min,
      'price_max', s.price_max,
      'delivery_estimate', s.delivery_estimate,
      'created_at', s.created_at
    )
  ) as services
from services s
left join users u on s.host_email = u.email
group by s.host_email, u.name, u.phone_number, u.usn, u.semester;

-- admin_student_carts view snapshots what students left in carts.
create or replace view admin_student_carts as
select
  c.user_email as student_email,
  u.name as student_name,
  u.phone_number,
  u.usn,
  u.semester,
  json_agg(
    json_build_object(
      'cart_id', c.id,
      'service_id', c.service_id,
      'quantity', c.quantity,
      'portfolio_link', c.portfolio_link,
      'message', c.message,
      'added_at', c.added_at
    )
  ) as items
from carts c
left join users u on c.user_email = u.email
group by c.user_email, u.name, u.phone_number, u.usn, u.semester;

