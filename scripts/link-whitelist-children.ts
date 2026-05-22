/**
 * Links whitelist children to their student records for all registered parents.
 * Run this whenever students are added after a parent has already logged in.
 */
import { Client } from "pg";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const client = new Client({ connectionString: process.env.DIRECT_URL });

async function main() {
  await client.connect();

  // Get all whitelist children that don't have a studentId yet
  const { rows: unlinked } = await client.query(`
    SELECT wc.id, wc."childName", wc."classYear", wc."className", wc."whitelistId", pw.relation,
           pp.id AS "parentProfileId"
    FROM "ParentWhitelistChild" wc
    JOIN "ParentWhitelist" pw ON pw.id = wc."whitelistId"
    JOIN "User" u ON u.email = pw.email
    JOIN "ParentProfile" pp ON pp."userId" = u.id
    WHERE wc."studentId" IS NULL
  `);

  console.log(`Found ${unlinked.length} unlinked whitelist children`);

  for (const row of unlinked) {
    // Find matching student by name + class
    const { rows: students } = await client.query(`
      SELECT s.id, s."fullName", c.year, c.name
      FROM "Student" s
      JOIN "Class" c ON c.id = s."classId"
      WHERE LOWER(s."fullName") LIKE LOWER($1)
        AND c.year = $2
        AND LOWER(c.name) = LOWER($3)
    `, [`%${row.childName}%`, row.classYear, row.className]);

    if (students.length === 0) {
      console.log(`  ✗ No student found for: ${row.childName} (Year ${row.classYear}${row.className})`);
      continue;
    }

    const student = students[0];
    console.log(`  ✓ Matched: ${row.childName} → ${student.fullName} (${student.id})`);

    // Upsert ParentStudent link
    await client.query(`
      INSERT INTO "ParentStudent" ("parentId", "studentId", relation)
      VALUES ($1, $2, $3)
      ON CONFLICT ("parentId", "studentId") DO NOTHING
    `, [row.parentProfileId, student.id, row.relation]);

    // Update whitelist child with studentId
    await client.query(`
      UPDATE "ParentWhitelistChild" SET "studentId" = $1 WHERE id = $2
    `, [student.id, row.id]);

    console.log(`  → Linked to parentProfileId: ${row.parentProfileId}`);
  }

  await client.end();
  console.log("Done.");
}

main().catch(e => { console.error(e); process.exit(1); });
