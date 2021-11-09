create table if not exists classes
(
    id          int auto_increment
        constraint `PRIMARY`
        primary key,
    num         int  not null,
    description text not null
);

create table if not exists files
(
    id   int auto_increment
        constraint `PRIMARY`
        primary key,
    name varchar(50) not null
);

create table if not exists accounts
(
    id       int auto_increment
        constraint `PRIMARY`
        primary key,
    num      int not null,
    id_class int not null,
    id_file  int not null,
    constraint accounts_classes_id_fk
        foreign key (id_class) references classes (id)
            on update cascade on delete cascade,
    constraint accounts_files_id_fk
        foreign key (id_file) references files (id)
            on update cascade on delete cascade
);

create table if not exists opening_balances
(
    id         int auto_increment
        constraint `PRIMARY`
        primary key,
    active     double not null,
    passive    double not null,
    id_account int    not null,
    constraint opening_balances_accounts_id_fk
        foreign key (id_account) references accounts (id)
            on update cascade on delete cascade
);

create table if not exists outgoing_balances
(
    id         int auto_increment
        constraint `PRIMARY`
        primary key,
    active     double not null,
    passive    double not null,
    id_account int    not null,
    constraint outgoing_balances_accounts_id_fk
        foreign key (id_account) references accounts (id)
            on update cascade on delete cascade
);

create table if not exists turnovers
(
    id         int auto_increment
        constraint `PRIMARY`
        primary key,
    debit      double not null,
    credit     double not null,
    id_account int    not null,
    constraint turnovers_accounts_id_fk
        foreign key (id_account) references accounts (id)
            on update cascade on delete cascade
);

insert into task2.classes(num, description) values(1, 'Денежные средства, драгоценные металлы и межбанковские операции' );
insert into task2.classes(num, description) values(2, 'Кредитные и иные активные операции с клиентами' );
insert into task2.classes(num, description) values(3, 'Счета по операциям клиентов' );
insert into task2.classes(num, description) values(4, 'Ценные бумаги' );
insert into task2.classes(num, description) values(5, 'Долгосрочные финансовые вложения в уставные фонды юридических лиц, основные средства и прочее имущество' );
insert into task2.classes(num, description) values(6, 'Прочие активы и прочие пассивы' );
insert into task2.classes(num, description) values(7, 'Собственный капитал банка' );
insert into task2.classes(num, description) values(8, 'Доходы банка' );
insert into task2.classes(num, description) values(9, 'Расходы банка' );
