⠋ Midway Starting Query: Delete FROM "flyway_history" WHERE "name" =? -- PARAMETERS: ["v1__init.sql"]
query: INSERT INTO "flyway_history"("id", "name", "hash", "timestamp", "success") VALUES (NULL, ? ,? ,? ,?) - the PARAMETERS: [" v1__init. SQL ", "0 c661bd7afebac224bbaa60bc5bb56e9", 1624693539781, 1]
query:  SELECT "FlywayHistory"."id" AS "FlywayHistory_id",  "FlywayHistory"."success" AS "FlywayHistory_success" FROM "flyway_history" "FlywayHistory" WHERE "FlywayHistory"."id" =  ? -- PARAMETERS: [1]
query: COMMIT
The 2021-06-26 15:45:39, 800 INFO 12245 [midfly] end -- -- -- -- -- -- -- -- -- -- -- -- --
```
