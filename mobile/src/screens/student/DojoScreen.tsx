import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';

interface Exercise {
  id: string;
  name: string;
  duration: string;
  completed: boolean;
  description: string;
}

interface Course {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  accent: string;
  accentLight: string;
  exerciseCount: number;
  completedCount: number;
  exercises: Exercise[];
}

const COURSES: Course[] = [
  {
    id: 'exam-calmness',
    title: 'Exam Calmness',
    icon: 'water-outline',
    accent: '#3B82F6',
    accentLight: '#EFF6FF',
    exerciseCount: 8,
    completedCount: 3,
    exercises: [
      { id: 'ec1', name: 'Pre-Exam Breathing', duration: '5 min', completed: true, description: 'A guided breathing exercise designed to calm your nervous system before exams. Focuses on 4-7-8 breathing pattern to reduce anxiety and sharpen focus.' },
      { id: 'ec2', name: 'Anxiety Dissolve', duration: '8 min', completed: true, description: 'Progressive muscle relaxation targeting exam-related tension. Systematically release stress from head to toe while building mental clarity.' },
      { id: 'ec3', name: 'Calm Visualization', duration: '10 min', completed: true, description: 'Visualize yourself confidently completing an exam. Build positive mental imagery that replaces fear with self-assurance.' },
      { id: 'ec4', name: 'Panic Reset', duration: '3 min', completed: false, description: 'Quick grounding technique for when panic strikes during an exam. Uses sensory anchoring to bring you back to the present moment.' },
      { id: 'ec5', name: 'Post-Exam Debrief', duration: '6 min', completed: false, description: 'Mindful reflection after an exam to process emotions and prevent rumination. Helps you let go and move forward regardless of outcome.' },
      { id: 'ec6', name: 'Sleep Before Exams', duration: '12 min', completed: false, description: 'A guided body scan and meditation specifically designed for the night before an important exam. Quiet the racing mind and drift off peacefully.' },
      { id: 'ec7', name: 'Confidence Anchor', duration: '7 min', completed: false, description: 'Create a physical and mental anchor for confidence that you can trigger anytime during an exam. Based on NLP anchoring techniques.' },
      { id: 'ec8', name: 'Time Pressure Training', duration: '5 min', completed: false, description: 'Mental conditioning to stay calm and think clearly under time constraints. Practice maintaining composure when the clock is ticking.' },
    ],
  },
  {
    id: 'focus-training',
    title: 'Focus Training',
    icon: 'eye-outline',
    accent: '#D97706',
    accentLight: '#FFFBEB',
    exerciseCount: 6,
    completedCount: 2,
    exercises: [
      { id: 'ft1', name: 'Single-Point Focus', duration: '5 min', completed: true, description: 'Train your attention by focusing on a single point. Builds the foundational skill of sustained concentration needed for deep study sessions.' },
      { id: 'ft2', name: 'Distraction Shield', duration: '7 min', completed: true, description: 'Learn to notice distractions without following them. Strengthen your ability to stay on task even in noisy or stimulating environments.' },
      { id: 'ft3', name: 'Deep Work Warmup', duration: '4 min', completed: false, description: 'A quick mental warmup routine before entering a deep work session. Primes your brain for sustained, high-quality cognitive output.' },
      { id: 'ft4', name: 'Attention Recovery', duration: '6 min', completed: false, description: 'Recover your focus after an interruption. Quickly re-engage with difficult material without losing the thread of your thinking.' },
      { id: 'ft5', name: 'Flow State Entry', duration: '8 min', completed: false, description: 'Guided meditation to enter a flow state for studying. Combines breath work, intention setting, and progressive immersion techniques.' },
      { id: 'ft6', name: 'Mind Wandering Catch', duration: '5 min', completed: false, description: 'Practice catching your mind wandering and gently returning to focus. Each catch strengthens your metacognitive awareness.' },
    ],
  },
  {
    id: 'confidence-building',
    title: 'Confidence Building',
    icon: 'shield-checkmark-outline',
    accent: '#059669',
    accentLight: '#ECFDF5',
    exerciseCount: 7,
    completedCount: 1,
    exercises: [
      { id: 'cb1', name: 'Strength Inventory', duration: '6 min', completed: true, description: 'Identify and internalize your academic strengths. Build a mental catalogue of your capabilities that you can draw upon when self-doubt arises.' },
      { id: 'cb2', name: 'Inner Critic Reframe', duration: '8 min', completed: false, description: 'Transform negative self-talk into constructive inner dialogue. Learn to challenge and reframe the thoughts that undermine your confidence.' },
      { id: 'cb3', name: 'Growth Mindset Meditation', duration: '10 min', completed: false, description: 'Cultivate a growth mindset through guided reflection. Embrace challenges as opportunities and see effort as the path to mastery.' },
      { id: 'cb4', name: 'Power Posing', duration: '4 min', completed: false, description: 'Physical confidence-building exercises combined with positive affirmations. Use body language to shift your mental state before presentations or exams.' },
      { id: 'cb5', name: 'Success Replay', duration: '7 min', completed: false, description: 'Vividly recall past academic successes to build confidence for future challenges. Strengthen neural pathways associated with competence and achievement.' },
      { id: 'cb6', name: 'Imposter Syndrome Relief', duration: '9 min', completed: false, description: 'Address feelings of being a fraud in academic settings. Normalize self-doubt and build authentic confidence in your abilities.' },
      { id: 'cb7', name: 'Assertiveness Training', duration: '6 min', completed: false, description: 'Build confidence to ask questions, participate in class, and advocate for yourself. Practice assertive communication in academic contexts.' },
    ],
  },
  {
    id: 'study-resilience',
    title: 'Study Resilience',
    icon: 'fitness-outline',
    accent: '#7C3AED',
    accentLight: '#EDE9FE',
    exerciseCount: 6,
    completedCount: 0,
    exercises: [
      { id: 'sr1', name: 'Bounce Back Breathing', duration: '5 min', completed: false, description: 'Breathing techniques for recovering from academic setbacks. Process disappointment and rebuild motivation to continue studying.' },
      { id: 'sr2', name: 'Burnout Prevention', duration: '10 min', completed: false, description: 'Mindful check-in to assess your energy levels and prevent burnout. Learn to pace yourself for long-term academic success.' },
      { id: 'sr3', name: 'Motivation Recharge', duration: '7 min', completed: false, description: 'Reconnect with your deeper purpose for studying. Rekindle intrinsic motivation when external pressures feel overwhelming.' },
      { id: 'sr4', name: 'Stress Inoculation', duration: '8 min', completed: false, description: 'Gradually expose yourself to manageable levels of academic stress to build tolerance. Like a vaccine for your mind against overwhelming pressure.' },
      { id: 'sr5', name: 'Grit Builder', duration: '6 min', completed: false, description: 'Strengthen your perseverance and passion for long-term goals. Build the mental toughness to push through difficult study periods.' },
      { id: 'sr6', name: 'Failure Processing', duration: '9 min', completed: false, description: 'A structured approach to processing academic failures constructively. Extract lessons, release shame, and move forward with renewed determination.' },
    ],
  },
];

export default function DojoScreen() {
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  const totalXP = 1250;
  const dayStreak = 7;
  const exercisesDone = 6;

  const toggleCourse = (courseId: string) => {
    setSelectedExercise(null);
    setExpandedCourse(expandedCourse === courseId ? null : courseId);
  };

  if (selectedExercise) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
        <View style={styles.exerciseDetailHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setSelectedExercise(null)}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.exerciseDetailTitle} numberOfLines={1}>
            {selectedExercise.name}
          </Text>
          <View style={{ width: 40 }} />
        </View>
        <ScrollView contentContainerStyle={styles.exerciseDetailContent}>
          <View style={styles.exerciseDetailCard}>
            <View style={styles.exerciseDetailIconWrap}>
              <Ionicons name="leaf-outline" size={48} color={Colors.primary} />
            </View>
            <Text style={styles.exerciseDetailName}>{selectedExercise.name}</Text>
            <View style={styles.exerciseDetailMeta}>
              <Ionicons name="time-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.exerciseDetailDuration}>{selectedExercise.duration}</Text>
              {selectedExercise.completed && (
                <>
                  <Ionicons name="checkmark-circle" size={16} color={Colors.success} style={{ marginLeft: 12 }} />
                  <Text style={[styles.exerciseDetailDuration, { color: Colors.success }]}>Completed</Text>
                </>
              )}
            </View>
            <Text style={styles.exerciseDetailDescription}>
              {selectedExercise.description}
            </Text>
            <TouchableOpacity style={styles.beginButton} activeOpacity={0.8}>
              <Ionicons name="play" size={20} color={Colors.white} />
              <Text style={styles.beginButtonText}>Begin Exercise</Text>
            </TouchableOpacity>
            <View style={styles.webNotice}>
              <Ionicons name="desktop-outline" size={18} color={Colors.textSecondary} />
              <Text style={styles.webNoticeText}>
                Full exercise available on web. Open mentivara.com for the complete experience.
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="fitness-outline" size={28} color={Colors.primary} />
            <Text style={styles.headerTitle}>Mental Dojo</Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="flame-outline" size={22} color="#F59E0B" />
            <Text style={styles.statValue}>{dayStreak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="star-outline" size={22} color={Colors.primary} />
            <Text style={styles.statValue}>{totalXP.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Total XP</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="checkmark-done-outline" size={22} color={Colors.success} />
            <Text style={styles.statValue}>{exercisesDone}</Text>
            <Text style={styles.statLabel}>Done</Text>
          </View>
        </View>

        {/* Course Cards */}
        <Text style={styles.sectionTitle}>Courses</Text>
        {COURSES.map((course) => {
          const progress = course.completedCount / course.exerciseCount;
          const isExpanded = expandedCourse === course.id;

          return (
            <View key={course.id} style={styles.courseCard}>
              <TouchableOpacity
                style={styles.courseHeader}
                onPress={() => toggleCourse(course.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.courseIconWrap, { backgroundColor: course.accentLight }]}>
                  <Ionicons name={course.icon} size={24} color={course.accent} />
                </View>
                <View style={styles.courseInfo}>
                  <Text style={styles.courseTitle}>{course.title}</Text>
                  <Text style={styles.courseExerciseCount}>
                    {course.exerciseCount} exercises
                  </Text>
                  {/* Progress Bar */}
                  <View style={styles.progressBarTrack}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${progress * 100}%`,
                          backgroundColor: course.accent,
                        },
                      ]}
                    />
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.startButton, { backgroundColor: course.accent }]}
                  activeOpacity={0.8}
                  onPress={() => toggleCourse(course.id)}
                >
                  <Text style={styles.startButtonText}>
                    {isExpanded ? 'Close' : 'Start'}
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>

              {/* Expanded Exercise List */}
              {isExpanded && (
                <View style={styles.exerciseList}>
                  {course.exercises.map((exercise, index) => (
                    <TouchableOpacity
                      key={exercise.id}
                      style={[
                        styles.exerciseItem,
                        index === course.exercises.length - 1 && { borderBottomWidth: 0 },
                      ]}
                      onPress={() => setSelectedExercise(exercise)}
                      activeOpacity={0.6}
                    >
                      <View style={styles.exerciseLeft}>
                        {exercise.completed ? (
                          <Ionicons name="checkmark-circle" size={22} color={Colors.success} />
                        ) : (
                          <View style={styles.exerciseCircle} />
                        )}
                        <View style={styles.exerciseTextWrap}>
                          <Text style={[
                            styles.exerciseName,
                            exercise.completed && styles.exerciseNameDone,
                          ]}>
                            {exercise.name}
                          </Text>
                          <Text style={styles.exerciseDuration}>{exercise.duration}</Text>
                        </View>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          );
        })}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
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
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  courseCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  courseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  courseIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  courseInfo: {
    flex: 1,
    gap: 4,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  courseExerciseCount: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    marginTop: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 6,
    borderRadius: 3,
  },
  startButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  startButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  exerciseList: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  exerciseLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  exerciseCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  exerciseTextWrap: {
    flex: 1,
    gap: 2,
  },
  exerciseName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  exerciseNameDone: {
    color: Colors.textSecondary,
  },
  exerciseDuration: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  // Exercise Detail
  exerciseDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  exerciseDetailTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  exerciseDetailContent: {
    padding: 20,
    paddingBottom: 40,
  },
  exerciseDetailCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  exerciseDetailIconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  exerciseDetailName: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  exerciseDetailMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
  },
  exerciseDetailDuration: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  exerciseDetailDescription: {
    fontSize: 15,
    lineHeight: 24,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 28,
  },
  beginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 20,
  },
  beginButtonText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: '700',
  },
  webNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  webNoticeText: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
});
