import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';

type LessonStatus = 'scheduled' | 'completed' | 'cancelled';

interface Lesson {
  id: string;
  subject: string;
  tutorName: string;
  date: string;
  time: string;
  duration: number;
  status: LessonStatus;
  isUpcoming: boolean;
}

const LESSONS: Lesson[] = [
  {
    id: '1',
    subject: 'Mathematics',
    tutorName: 'Dr. Sarah Chen',
    date: 'Today',
    time: '4:00 PM',
    duration: 60,
    status: 'scheduled',
    isUpcoming: true,
  },
  {
    id: '2',
    subject: 'Physics',
    tutorName: 'James Okafor',
    date: 'Tomorrow',
    time: '10:00 AM',
    duration: 90,
    status: 'scheduled',
    isUpcoming: true,
  },
  {
    id: '3',
    subject: 'English Literature',
    tutorName: 'Emily Hart',
    date: 'Wed, 26 Mar',
    time: '2:00 PM',
    duration: 60,
    status: 'scheduled',
    isUpcoming: true,
  },
  {
    id: '4',
    subject: 'Chemistry',
    tutorName: 'Dr. Raj Patel',
    date: 'Fri, 28 Mar',
    time: '11:00 AM',
    duration: 45,
    status: 'scheduled',
    isUpcoming: true,
  },
  {
    id: '5',
    subject: 'Mathematics',
    tutorName: 'Dr. Sarah Chen',
    date: 'Mon, 17 Mar',
    time: '4:00 PM',
    duration: 60,
    status: 'completed',
    isUpcoming: false,
  },
  {
    id: '6',
    subject: 'Physics',
    tutorName: 'James Okafor',
    date: 'Sat, 15 Mar',
    time: '10:00 AM',
    duration: 90,
    status: 'completed',
    isUpcoming: false,
  },
  {
    id: '7',
    subject: 'English Literature',
    tutorName: 'Emily Hart',
    date: 'Thu, 13 Mar',
    time: '2:00 PM',
    duration: 60,
    status: 'cancelled',
    isUpcoming: false,
  },
  {
    id: '8',
    subject: 'Chemistry',
    tutorName: 'Dr. Raj Patel',
    date: 'Tue, 11 Mar',
    time: '11:00 AM',
    duration: 45,
    status: 'completed',
    isUpcoming: false,
  },
];

const STATUS_CONFIG: Record<LessonStatus, { label: string; bg: string; text: string }> = {
  scheduled: { label: 'Scheduled', bg: Colors.primaryLight, text: Colors.primary },
  completed: { label: 'Completed', bg: '#ECFDF5', text: Colors.success },
  cancelled: { label: 'Cancelled', bg: '#FFF1F2', text: Colors.error },
};

export default function LessonsScreen() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  const filteredLessons = LESSONS.filter((l) =>
    activeTab === 'upcoming' ? l.isUpcoming : !l.isUpcoming
  );

  const nextLesson = LESSONS.find((l) => l.isUpcoming && l.status === 'scheduled');

  const renderNextLessonCard = () => {
    if (!nextLesson || activeTab !== 'upcoming') return null;
    return (
      <LinearGradient
        colors={[Colors.primary, Colors.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.nextLessonCard}
      >
        <View style={styles.nextLessonHeader}>
          <View style={styles.nextLessonBadge}>
            <Text style={styles.nextLessonBadgeText}>Next Lesson</Text>
          </View>
          <Text style={styles.nextLessonTime}>{nextLesson.time}</Text>
        </View>
        <Text style={styles.nextLessonSubject}>{nextLesson.subject}</Text>
        <Text style={styles.nextLessonTutor}>with {nextLesson.tutorName}</Text>
        <View style={styles.nextLessonFooter}>
          <View style={styles.nextLessonMeta}>
            <Ionicons name="calendar-outline" size={14} color="rgba(255,255,255,0.8)" />
            <Text style={styles.nextLessonMetaText}>{nextLesson.date}</Text>
          </View>
          <View style={styles.nextLessonMeta}>
            <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.8)" />
            <Text style={styles.nextLessonMetaText}>{nextLesson.duration} min</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.joinButtonLarge} activeOpacity={0.8}>
          <Ionicons name="videocam" size={18} color={Colors.primary} />
          <Text style={styles.joinButtonLargeText}>Join Lesson</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  };

  const renderLessonCard = ({ item }: { item: Lesson }) => {
    const statusCfg = STATUS_CONFIG[item.status];
    return (
      <View style={styles.lessonCard}>
        <View style={styles.lessonCardTop}>
          <View style={styles.lessonInfo}>
            <Text style={styles.lessonSubject}>{item.subject}</Text>
            <Text style={styles.lessonTutor}>{item.tutorName}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
            <Text style={[styles.statusBadgeText, { color: statusCfg.text }]}>
              {statusCfg.label}
            </Text>
          </View>
        </View>
        <View style={styles.lessonMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.metaText}>{item.date}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.metaText}>{item.time}</Text>
          </View>
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>{item.duration} min</Text>
          </View>
        </View>
        <View style={styles.lessonCardActions}>
          {item.status === 'scheduled' && item.isUpcoming && (
            <TouchableOpacity style={styles.joinButton} activeOpacity={0.7}>
              <Ionicons name="videocam" size={16} color={Colors.white} />
              <Text style={styles.joinButtonText}>Join</Text>
            </TouchableOpacity>
          )}
          {item.status === 'completed' && (
            <TouchableOpacity style={styles.viewPackageButton} activeOpacity={0.7}>
              <Ionicons name="document-text-outline" size={16} color={Colors.primary} />
              <Text style={styles.viewPackageText}>View Package</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Lessons</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upcoming' && styles.tabActive]}
          onPress={() => setActiveTab('upcoming')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.tabTextActive]}>
            Upcoming
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'past' && styles.tabActive]}
          onPress={() => setActiveTab('past')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'past' && styles.tabTextActive]}>
            Past
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredLessons}
        keyExtractor={(item) => item.id}
        renderItem={renderLessonCard}
        ListHeaderComponent={renderNextLessonCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={48} color={Colors.border} />
            <Text style={styles.emptyText}>No lessons found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: Colors.border,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: Colors.white,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.text,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  nextLessonCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  nextLessonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  nextLessonBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  nextLessonBadgeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  nextLessonTime: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '500',
  },
  nextLessonSubject: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 4,
  },
  nextLessonTutor: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 16,
  },
  nextLessonFooter: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  nextLessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  nextLessonMetaText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
  },
  joinButtonLarge: {
    backgroundColor: Colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  joinButtonLargeText: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  lessonCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  lessonCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  lessonInfo: {
    flex: 1,
    marginRight: 12,
  },
  lessonSubject: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  lessonTutor: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  durationBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  durationText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  lessonCardActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
  },
  joinButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  joinButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  viewPackageButton: {
    backgroundColor: Colors.primaryLight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  viewPackageText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
});
