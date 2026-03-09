console.log("Seeding Kinlink demo data...");
console.table([
  { workspace: "Family Circle", user: "Alex", device: "Alex MacBook", resource: "Family Photos" },
  { workspace: "Family Circle", user: "Will", device: "Will Laptop", resource: "Media Library" },
  { workspace: "Family Circle", user: "Erin", device: "Erin Tablet", resource: "Kitchen Printer" }
]);
console.log("Policies:");
console.log("- Will can access Family Photos and Media Library");
console.log("- Erin can access Kitchen Printer only");
console.log("- Alex can access everything");
