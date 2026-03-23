import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { useAuth } from '../../store/authStore';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

interface StatCard {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const stats: StatCard[] = [
  { label: 'Streak', value: '5 days', icon: 'flame', color: '#F59E0B' },
  { label: 'XP', value: '1,250', icon: 'star', color: Colors.primary },
  { label: 'Lessons', value: '12', icon: 'book', color: Colors.success },
];

interface QuickAction {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const quickActions: QuickAction[] = [
  { label: 'Find Tutor', icon: 'search', color: '#7C3AED' },
  { label: 'Exam Prep', icon: 'school', color: '#2563EB' },
  { label: 'Doubt Solver', icon: 'help-circle', color: '#DC2626' },
  { label: 'Study Missions', icon: 'rocket', color: '#EA580C' },
  { label: 'Knowledge Map', icon: 'map', color: '#0891B2' },
  { label: 'Mental Dojo', icon: 'fitness', color: '#059669' },
];

interface TutorReel {
  id: string;
  tutor: string;
  topic: string;
  color: string;
}

const tutorReels: TutorReel[] = [
  { id: '1', tutor: 'Dr. Sarah', topic: 'Calculus Tips', color: '#7C3AED' },
  { id: '2', tutor: 'Mr. Patel', topic: 'Physics Hacks', color: '#2563EB' },
  { id: '3', tutor: 'Ms. Rivera', topic: 'Essay Writing', color: '#DC2626' },
  { id: '4', tutor: 'Prof. Kim', topic: 'Chem Basics', color: '#059669' },
  { id: '5', tutor: 'Dr. Ahmed', topic: 'Bio Review', color: '#EA580C' },
];

export default function DashboardScreen() {
  const { user } = useAuth();
  const firstName = user?.name.split(' ')[0] ?? 'Student';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting */}
        <View style={styles.header}>
          <Text style={styles.greeting}>
            {getGreeting()}, {firstName}
          </Text>
          <Text style={styles.greetingSub}>Ready to learn something new?</Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {stats.map((stat) => (
            <View key={stat.label} style={styles.statCard}>
              <Ionicons name={stat.icon} size={22} color={stat.color} />
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Next Lesson */}
        <View style={styles.nextLessonCard}>
          <View style={styles.nextLessonHeader}>
            <View style={styles.nextLessonBadge}>
              <Text style={styles.nextLessonBadgeText}>NEXT LESSON</Text>
            </View>
          </View>
          <Text style={styles.nextLessonSubject}>Advanced Mathematics</Text>
          <Text style={styles.nextLessonTutor}>with Dr. Sarah Mitchell</Text>
          <View style={styles.nextLessonTimeRow}>
            <Ionicons name="calendar-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.nextLessonTime}>Today, 3:00 PM - 4:00 PM</Text>
          </View>
          <TouchableOpacity style={styles.joinButton} activeOpacity={0.8}>
            <Ionicons name="videocam" size={18} color={Colors.white} />
            <Text style={styles.joinButtonText}>Join Lesson</Text>
          </TouchableOpacity>
        </View>

        {/* Tutor Reels */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Tutor Reels</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={tutorReels}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.reelsList}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.reelCard} activeOpacity={0.8}>
              <View style={[styles.reelThumb, { backgroundColor: item.color }]}>
                <Ionicons name="play-circle" size={32} color="rgba(255,255,255,0.9)" />
              </View>
              <Text style={styles.reelTutor} numberOfLines={1}>
                {item.tutor}
              </Text>
              <Text style={styles.reelTopic} numberOfLines={1}>
                {item.topic}
              </Text>
            </TouchableOpacity>
          )}
        />

        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>
        <View style={styles.actionsGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity key={action.label} style={styles.actionCard} activeOpacity={0.7}>
              <View style={[styles.actionIcon, { backgroundColor: action.color + '15' }]}>
                <Ionicons name={action.icon} size={24} color={action.color} />
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 32,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
  },
  greetingSub: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  nextLessonCard: {
    marginHorizontal: 20,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  nextLessonHeader: {
    marginBottom: 12,
  },
  nextLessonBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  nextLessonBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  nextLessonSubject: {
    fontSize: 19,
    fontWeight: '700',
    color: Colors.text,
  },
  nextLessonTutor: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
    fontWeight: '500',
  },
  nextLessonTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  nextLessonTime: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  joinButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  seeAll: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  reelsList: {
    paddingHorizontal: 20,
    gap: 14,
    marginBottom: 24,
  },
  reelCard: {
    width: 120,
  },
  reelThumb: {
    width: 120,
    height: 160,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  reelTutor: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  reelTopic: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  actionCard: {
    width: '30%',
    backgroundColor: Colors.card,
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
  },
});
