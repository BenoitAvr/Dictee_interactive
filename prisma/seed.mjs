import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const dictations = [
  {
    title: "La rentrée des classes",
    level: "Débutant",
    text: "C'est la rentrée des classes. Les élèves retrouvent leurs camarades dans la cour de l'école. La maîtresse ouvre la porte et invite tout le monde à s'asseoir.",
    excerpt: "Une courte dictée sur le thème de la rentrée.",
    audio_url: "",
    audio_name: "rentree.mp3",
    audio_total_part: 1,
    audio_duration_minutes: 0,
    audio_duration_seconds: 45,
  },
  {
    title: "Une promenade en forêt",
    level: "Intermédiaire",
    text: "Le dimanche matin, ma famille et moi partons nous promener en forêt. Les feuilles jaunes tombent doucement des arbres. On entend les oiseaux chanter et parfois un écureuil traverse le sentier.",
    excerpt: "Balade dominicale et description de la nature.",
    audio_url: "",
    audio_name: "promenade.mp3",
    audio_total_part: 1,
    audio_duration_minutes: 1,
    audio_duration_seconds: 10,
  },
  {
    title: "Le petit chat perdu",
    level: "Avancé",
    text: "Hier soir, un petit chat noir s'est perdu dans notre quartier. Il miaulait tristement devant la boulangerie. Une voisine lui a offert un bol de lait avant d'appeler la fourrière pour retrouver son propriétaire.",
    excerpt: "Histoire courte avec dialogue implicite et ponctuation variée.",
    audio_url: "",
    audio_name: "chat-perdu.mp3",
    audio_total_part: 1,
    audio_duration_minutes: 1,
    audio_duration_seconds: 30,
  },
];

async function main() {
  for (const d of dictations) {
    await prisma.dictation.upsert({
      where: { title: d.title },
      update: {},
      create: d,
    });
  }
  console.log(`Seeded ${dictations.length} dictations.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
