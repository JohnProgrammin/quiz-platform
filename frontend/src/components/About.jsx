import React from 'react';
import { Link } from 'react-router-dom';
import PublicHeader from './PublicHeader';
import { CheckCircle, Lightbulb, EmojiEvents, TrendingUp } from '@mui/icons-material';

function About() {
  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-black text-ink mb-8">About FloraQuiz</h1>

          <div className="prose max-w-none text-slate text-lg leading-relaxed space-y-6">
            <p>
              FloraQuiz is an AI-powered study platform designed to help students learn smarter, not harder. We believe that personalized, adaptive learning is the future of education.
            </p>

            <h2 className="text-3xl font-black text-ink mt-12 mb-4">Our Mission</h2>
            <p>
              Our mission is to make quality education accessible to everyone. By leveraging artificial intelligence and spaced repetition, we help students identify their weak areas and master any subject.
            </p>

            <h2 className="text-3xl font-black text-ink mt-12 mb-4">How It Works</h2>
            <p>
              Simply upload your notes, and our AI generates personalized quizzes tailored to your content. Get instant feedback, identify weak topics, and practice targeted mastery quizzes until you've mastered the material.
            </p>

            <h2 className="text-3xl font-black text-ink mt-12 mb-4">Why FloraQuiz?</h2>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-brand-500 flex-shrink-0 mt-1" />
                <span>AI-generated quizzes from your own notes</span>
              </li>
              <li className="flex items-start gap-3">
                <TrendingUp className="w-6 h-6 text-brand-500 flex-shrink-0 mt-1" />
                <span>Personalized learning paths based on your performance</span>
              </li>
              <li className="flex items-start gap-3">
                <Lightbulb className="w-6 h-6 text-brand-500 flex-shrink-0 mt-1" />
                <span>Intelligent feedback to help you understand mistakes</span>
              </li>
              <li className="flex items-start gap-3">
                <EmojiEvents className="w-6 h-6 text-brand-500 flex-shrink-0 mt-1" />
                <span>Mastery-focused approach to learning</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-brand-500 flex-shrink-0 mt-1" />
                <span>Available in multiple languages</span>
              </li>
            </ul>
          </div>

          <div className="mt-12">
            <Link to="/" className="text-brand-500 font-bold hover:text-brand-400">
              ← Back to home
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;
