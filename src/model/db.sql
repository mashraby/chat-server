create table users(
    user_id serial not null primary key,
    user_name varchar(64) not null, 
    user_email varchar(128) not null,
    user_password varchar(64) not null
);

insert into users(user_name, user_email, user_password) values('Mashrab', 'mashrab@gmail.com', '1111');

create table messages(
    message_id serial not null primary key, 
    message_from varchar(64), 
    message_to varchar(64),
    message_content text not null
);