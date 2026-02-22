-- Creating Users Table
create table users(
    id serial primary key,
    name varchar(255) not null,
    email varchar(255) not null,
    phone varchar(255) not null,
    password varchar(255) not null,
    role varchar(255) not null check (role in ('USER', 'ADMIN')),
    created_at timestamp default current_timestamp,
    unique(email, phone)
);

-- Creating Train Table
create table trains(
    id serial primary key,
    train_no varchar(255) not null,
    train_name varchar(255) not null,
    source varchar(255) not null,
    destination varchar(255) not null,
    created_at timestamp default current_timestamp,
    unique(train_no, train_name)
);

-- Creating Tickets Table
create table tickets(
    id serial primary key,
    user_id integer references users(id),
    train_id integer references trains(id),
    journey_date date default (current_date),
    class_train varchar(255) not null,
    seat_no varchar(255) not null,
    status varchar(255) not null check (status in ('BOOKED', 'CANCELLED')),
    PNR_no varchar(255) not null,
    created_at timestamp default current_timestamp,
    unique(user_id, train_id, seat_no),
    unique(PNR_no)
);

-- Creating Schedule Table
create table schedules(
    id serial primary key,
    train_id integer references trains(id),
    start_station varchar(255) not null,
    end_station varchar(255) not null,
    departure_time time not null,
    arrival_time time not null,
    day_off varchar(255) not null,
    created_at timestamp default current_timestamp,
    unique(train_id)
);

-- Creating Seat Inventory Table
create table seat_inventory(
    id serial primary key,
    train_id integer references trains(id),
    date DATE default (current_date),
    class_train varchar(255) not null,
    total_seats integer not null,
    available_seats integer not null,
    created_at timestamp default current_timestamp,
    unique(train_id, date, class_train)
);

-- Creating Complaint Table
create table complaints(
    id serial primary key,
    user_id integer references users(id),
    train_id integer references trains(id),
    message varchar(255) not null,
    status varchar(255) not null check (status in ('PENDING', 'RESOLVED')),
    created_at timestamp default current_timestamp
);

-- Creating Payments Table
create table payments(
    id serial primary key,
    user_id integer references users(id),
    train_id integer references trains(id),
    amount integer not null,
    payment_date date default (current_date),
    status varchar(255) not null check (status in ('PENDING', 'BOOKED', 'FAILED')),
    created_at timestamp default current_timestamp,
    unique(train_id)
);
