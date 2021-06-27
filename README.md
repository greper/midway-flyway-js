# midway-flyway-js

[English](./README.md) | [简体中文](./README_zhCN.md)

'midway-flyway-js' is a JS implementation of Flyway base on Typeorm.
This project is built as a Midway component that seamlessly integrates with Midway.

# Flyway
Flyway is a Java version of the database upgrade migration solution.
It can automatically check the script directory at server startup, execute SQL upgrade scripts, and record execution history.

This project implements the database upgrade migration scheme according to the idea similar to flyway

# Get start

## 1. Preparation
* nodejs environment
* midway project

## 2. Installation
```
npm install midway-flyway-js
# or
yarn add midway-flyway-js
```
## 3. Integration
```js
import * as orm from 'typeorm';
import * as flyway from 'midway-flyway-js';
@Configuration({
imports: [
    orm,// Load the ORM component
    flyway // Load the Flyway component
]
})
export class ContainerConfiguration {}
```

## 4. Configuration parameters [Optional]
`/src/config/config.default.js` file
```js
export const flyway ={
// script directory
// default "./db/migration"
scriptDir:"./db/migration",
// The baseline, baseline script and previous scripts are skipped and not executed.
// Default: null
// If you start from an empty database ,you do not need to configure this
baseline: 'v1__init.sql',
// Execute the record table name,
// Default: flyway_history
flywayTableName:'flyway_history',
// If hash values are allowed to differ
// Default: false
// If an SQL file with the same name is changed, the hash will change
// A hash conflict error is reported at this point
// Set this parameter to true. Hash conflict errors will be ignored
allowHashNotMatch:false
}

```
## 5. Write upgrade sql file

Put your SQL update script in the directory '/src/db/migration'

The recommended naming convention 'v{version}__{name}.sql', for example 'v1__init.sql'


## 6. Start midway server
```
npm run dev
```

## 7. Run effects
The following effect is a record of the 'v1__init.sql' script being automatically executed after Midway is automatically started
```
The 2021-06-26 15:45:39, 630 INFO 12245 [midfly] start -------------------------
query: SELECT * FROM "sqlite_master" WHERE "type" = 'table' AND "name" = 'flyway_history'
query:  CREATE TABLE "flyway_history" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "timestamp" bigint NOT NULL,  "name" varchar NOT NULL, "hash" varchar, "success" boolean)
query: BEGIN TRANSACTION
query:  SELECT "FlywayHistory"."id" AS "FlywayHistory_id", "FlywayHistory"."name" AS "FlywayHistory_name",  "FlywayHistory"."hash" AS "FlywayHistory_hash", "FlywayHistory"."timestamp" AS "FlywayHistory_timestamp",  "FlywayHistory"."success" AS "FlywayHistory_success" FROM "flyway_history" "FlywayHistory" WHERE "FlywayHistory"."name"  =? AND "FlywayHistory"."success" = ?  LIMIT 1 -- PARAMETERS: ["v1__init.sql",1]
2021-06-26 15:45:39,664 INFO 12245 NEED EXEC SCRIPT FILE:
2021-06-26 15:45:39,666 INFO 12245 [midfly] exec
Query: -- table: sys_permission
CREATE TABLE "sys_permission" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "title" varchar(100) NOT NULL,  "permission" varchar(100), "parent_id" integer NOT NULL DEFAULT (-1), "sort" integer NOT NULL,  "create_time" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),  "update_time" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP));
query:  INSERT INTO SYS_PERmission (id, title, permission, parent_id, sort, create_time, update_time) VALUES (1, 'admin ', 'sys', 1, 1, 1, 1624085863636);
Query: -- table: sys_role
CREATE TABLE "sys_role" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar(100) NOT NULL,  "create_time" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),  "update_time" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP));
Query: INSERT INTO SYS_ROLE (id, name, create_time, update_time) VALUES (1, 'administrator ', 1, 1623749138537);
Query: -- table: sys_role_permission
CREATE TABLE "sys_role_permission" ("role_id" integer NOT NULL, "permission_id" integer NOT NULL,  PRIMARY KEY ("role_id", "permission_id"));
query: INSERT INTO sys_role_permission (role_id, permission_id) VALUES (1, 1);
Query: -- table: sys_user
CREATE TABLE "sys_user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "username" varchar(100) NOT NULL,  "password" varchar(50) NOT NULL, "nick_name" varchar(50), "avatar" varchar(255), "phone_code" varchar(20),  "mobile" varchar(20), "email" varchar(100),"remark" varchar(100), "status" integer NOT NULL DEFAULT (1),  "create_time" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),  "update_time" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP));
query:  INSERT INTO sys_user (id, username, password, nick_name, avatar, phone_code, mobile, email, status, create_time,  update_time,remark) VALUES (1, 'admin', 'e10adc3949ba59abbe56e057f20f883e', 'admin', NULL, NULL, NULL, NULL, 1,  2011123132, 123132,NULL);
Query: -- table: sys_user_role
CREATE TABLE "sys_user_role" ("role_id" integer NOT NULL, "user_id" integer NOT NULL, PRIMARY KEY ("role_id",  "user_id"));
query: INSERT INTO sys_user_role (role_id, user_id) VALUES (1, 1);
Query: - index: IDX_223de54d6badbe43a5490450c3
CREATE UNIQUE INDEX "IDX_223de54d6badbe43a5490450c3" ON "sys_role" ("name");
Query: - index: IDX_9e7164b2f1ea1348bc0eb0a7da
CREATE UNIQUE INDEX "IDX_9e7164b2f1ea1348bc0eb0a7da" ON "sys_user" ("username");
Query: Delete FROM "flyway_history" WHERE "name" =? -- PARAMETERS: ["v1__init.sql"]
query: INSERT INTO "flyway_history"("id", "name", "hash", "timestamp", "success") VALUES (NULL, ? ,? ,? ,?) - the PARAMETERS: [" v1__init. SQL ", "0 c661bd7afebac224bbaa60bc5bb56e9", 1624693539781, 1]
query:  SELECT "FlywayHistory"."id" AS "FlywayHistory_id",  "FlywayHistory"."success" AS "FlywayHistory_success" FROM "flyway_history" "FlywayHistory" WHERE "FlywayHistory"."id" =  ? -- PARAMETERS: [1]
query: COMMIT
The 2021-06-26 15:45:39, 800 INFO 12245 [midfly] end --------------------------
```
# Announcements
The last line of the SQL file should be uncommented and should end with a semicolon of the SQL statement.

# They're using it
* [fs-server-js](https://github.com/fast-crud/fs-server-js)

# Reference Items
* [flyway] (https://github.com/flyway/flyway) : Java version flyway
* [flyway-js] (https://github.com/wanglihui/flyway-js) : Sequelize flyway

Thanks for the above project
