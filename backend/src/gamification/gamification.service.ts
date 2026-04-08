import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Gamification } from './schemas/gamification.schema';

@Injectable()
export class GamificationService {
  private readonly logger = new Logger(GamificationService.name);

  private readonly rules = {
    login: 10,
    health_log: 20,
    appointment_complete: 100,
    chat_sent: 5,
    medication_track: 15,
    nurse_escalation: 30,
    doctor_resolution: 50,
  };

  private readonly levels = { 
    bronze: 0,
    silver: 2000,
    gold: 5000,
    platinum: 10000,
  };

  constructor(
    @InjectModel(Gamification.name) private gamificationModel: Model<Gamification>,
  ) {}

  async getStats(userId: string, role: string): Promise<Gamification> {
    let stats = await this.gamificationModel.findOne({ userId });
    
    if (!stats) {
      stats = new this.gamificationModel({ 
        userId, 
        role,
        points: 0,
        level: 1,
        streak: 1,
        lastActivityDate: new Date()
      });
      await stats.save();
    }
    return stats;
  }

  async awardPoints(userId: string, role: string, action: keyof typeof this.rules): Promise<void> {
    const points = this.rules[action] || 0;
    if (points === 0) return;

    let stats = await this.getStats(userId, role);

    if (action === 'login') {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const alreadyAwardedToday = stats.history.some(
        (h) => h.action === 'login' && new Date(h.date) >= todayStart
      );
      if (alreadyAwardedToday) {
        this.logger.log(`User ${userId} already received login points today.`);
        return;
      }
    }

    stats.points += points;
    
    // Level calculation check
    const newLevel = Math.floor(stats.points / 500) + 1;
    if (newLevel > stats.level) {
      stats.level = newLevel;
      // You could push a 'Level Up' badge here
    }

    // Add to history (keep only last 20 for performance)
    stats.history.push({ action, points, date: new Date() });
    if (stats.history.length > 20) stats.history.shift();
    
    // Update streaks if this is the first qualifying action today
    await this.updateStreak(stats);

    // Check for specific badges
    this.checkForBadges(stats, action);

    await stats.save();
    this.logger.log(`Awarded ${points} points to user ${userId} for action ${action}`);
  }

  private async updateStreak(stats: Gamification): Promise<void> {
    const now = new Date();
    const lastActivity = stats.lastActivityDate;
    
    if (!lastActivity) {
      stats.streak = 1;
      stats.lastActivityDate = now;
      return;
    }

    const diffMs = now.getTime() - lastActivity.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      stats.streak += 1;
      stats.lastActivityDate = now;
    } else if (diffDays > 1) {
      stats.streak = 1;
      stats.lastActivityDate = now;
    }
    // If diffDays is 0, they already active today, do nothing.
  }

  private checkForBadges(stats: Gamification, action: string): void {
    const hasBadge = (name: string) => stats.badges.some(b => b.name === name);
    const addBadge = (name: string, icon: string, description: string) => {
      if (!hasBadge(name)) {
        stats.badges.push({ name, icon, description, dateEarned: new Date() });
      }
    };

    // Rule: First Login
    if (action === 'login') {
      addBadge('Early Adopter', 'ri-rocket-line', 'Welcome to the MediFollow family!');
    }

    // Rule: Health Champ (10 logs)
    const healthLogs = stats.history.filter(h => h.action === 'health_log').length;
    if (healthLogs >= 10) {
      addBadge('Health Warrior', 'ri-heart-pulse-line', 'Tracked health 10 times. Consistency is key!');
    }

    // Rule: Streak badge
    if (stats.streak >= 7) {
      addBadge('Weekly Hero', 'ri-calendar-check-line', 'Maintained a 7-day activity streak!');
    }

    // Role specific badges
    if (stats.role === 'doctor' && action === 'appointment_complete') {
        const docAppts = stats.history.filter(h => h.action === 'appointment_complete').length;
        if (docAppts >= 5) {
            addBadge('Master Consultant', 'ri-stethoscope-fill', 'Successfully managed 5 patient consultations.');
        }
    }
  }
}
