/* server/seed.js */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('./models/Course');

// Load env vars
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected for Seeding...'))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });

// The CareerLift Course Data
const courses = [
    {
        title: "Caregiving (Level 2 & 3)",
        category: "medical",
        type: "paid",
        thumbnail: "https://placehold.co/600x400/00d4ff/0f172a?text=Caregiving",
        price: "15,000 BDT",
        rating: 5.0,
        students: "Elderly & Child Care",
        overview: "Learn professional caregiving for elderly and children. Job ready certification.",
        specialCode: "CL-CARE-01"
    },
    {
        title: "Medical Scribing (Level 3)",
        category: "medical",
        type: "paid",
        thumbnail: "https://placehold.co/600x400/7b2cbf/0f172a?text=Medical+Scribing",
        price: "20,000 BDT",
        rating: 4.9,
        students: "Doctor Assistant",
        overview: "Become a real-time assistant for doctors. High demand abroad.",
        specialCode: "CL-SCRIBE-01"
    },
    {
        title: "Graphics Design",
        category: "freelancing",
        type: "paid",
        thumbnail: "https://placehold.co/600x400/f72585/0f172a?text=Graphics+Design",
        price: "10,000 BDT",
        rating: 4.8,
        students: "Freelancing",
        overview: "Master Photoshop and Illustrator to start your freelancing career.",
        specialCode: "CL-GFX-01"
    },
    {
        title: "Digital Marketing",
        category: "freelancing",
        type: "paid",
        thumbnail: "https://placehold.co/600x400/00d4ff/0f172a?text=Digital+Marketing",
        price: "15,000 BDT",
        rating: 4.7,
        students: "SEO & Social",
        overview: "Learn SEO, Social Media Marketing and Content Strategy.",
        specialCode: "CL-DM-01"
    },
    {
        title: "Diploma in Tourism",
        category: "diploma",
        type: "paid",
        thumbnail: "https://placehold.co/600x400/7b2cbf/0f172a?text=Tourism+Diploma",
        price: "Call for Price",
        rating: 5.0,
        students: "UK OTHM Level-3",
        overview: "UK based OTHM Level-3 Diploma. Equivalent to A-Levels.",
        specialCode: "CL-TOUR-01"
    },
    // FREE COURSES
    {
        title: "Basic Computer Skills",
        category: "free",
        type: "free",
        thumbnail: "https://placehold.co/600x400/22c55e/0f172a?text=Basic+Computer",
        price: "Free",
        rating: 4.5,
        students: "Beginner Friendly",
        syllabus: "1. MS Word\n2. MS Excel\n3. PowerPoint\n4. Email Etiquette",
        videoLink: "https://www.youtube.com/watch?v=example"
    },
    {
        title: "Freelancing Guideline",
        category: "free",
        type: "free",
        thumbnail: "https://placehold.co/600x400/22c55e/0f172a?text=Freelance+Guide",
        price: "Free",
        rating: 4.8,
        students: "Career Path",
        syllabus: "1. Profile Creation\n2. Bidding Strategy\n3. Portfolio Management",
        videoLink: "https://www.youtube.com/watch?v=example"
    }
];

const importData = async () => {
    try {
        await Course.deleteMany(); // Clears existing data to avoid duplicates
        console.log('Data Destroyed...');

        await Course.insertMany(courses);
        console.log('Data Imported!');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

importData();