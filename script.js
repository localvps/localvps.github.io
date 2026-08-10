const skills = [
  "TypeScript",
  "Node.js",
  "React",
  "PHP",
  "Java",
  "CSS / HTML",
  "C#",
];

const grid = document.getElementById("skills-grid");

skills.forEach((skill) => {
  const card = document.createElement("div");
  card.className = "skill-card";
  card.textContent = skill;
  grid.appendChild(card);
});
