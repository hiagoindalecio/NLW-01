drop database if exists db_ecoleta;
create db_ecoleta;
use db_ecoleta;

create table tb_points (
	id_point int auto_increment,
	email varchar(50) not null,
	name varchar(50) not null,
	whatsapp varchar(17) not null,
	image longblob not null,
	latitude varchar(50) not null,
	longitude varchar(50) not null,
	city varchar(20) not null,
	uf varchar(2) not null,
	primary key (id_point)
);

create table tb_items (
	id_item int auto_increment,
	title varchar(20) not null,
	image longblob not null,
	primary key (id_item)
);

create table point_itens (
	point_id int,
	item_id int,
	primary key (point_id, item_id)
);
alter table point_itens
add constraint FK_point_id
foreign key (point_id) references tb_points(id_point);
alter table point_itens
add constraint FK_item_id
foreign key (item_id) references tb_items(id_item);