import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';

interface Review {
  id: string;
  studentName: string;
  studentInitials: string;
  rating: number;
  date: string;
  comment: string;
}

interface TutorProfile {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  headline: string;
  bio: string;
  subjects: string[];
  levels: string[];
  qualifications: string[];
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  lessonsCompleted: number;
  responseTime: string;
  reviews: Review[];
}

const TUTOR_PROFILES: Record<string, TutorProfile> = {
  '1': {
    id: '1',
    name: 'Dr. Sarah Chen',
    initials: 'SC',
    avatarColor: '#7C3AED',
    headline: 'Oxford-trained mathematician with 10+ years of experience',
    bio: 'I am passionate about making mathematics accessible and enjoyable for all students. With a PhD from Oxford and over a decade of teaching experience at both university and secondary levels, I specialise in helping students build confidence and achieve their academic goals. My approach combines rigorous problem-solving with intuitive understanding.',
    subjects: ['Mathematics', 'Further Maths', 'Statistics'],
    levels: ['GCSE', 'A-Level', 'IB', 'University'],
    qualifications: [
      'PhD Mathematics, University of Oxford',
      'PGCE Secondary Mathematics',
      'BSc Mathematics (First Class), UCL',
      'Senior Examiner, AQA Mathematics',
    ],
    rating: 4.9,
    reviewCount: 127,
    hourlyRate: 65,
    lessonsCompleted: 842,
    responseTime: '< 1 hour',
    reviews: [
      {
        id: 'r1',
        studentName: 'Alex T.',
        studentInitials: 'AT',
        rating: 5,
        date: '2 weeks ago',
        comment: 'Dr. Chen is brilliant. She explains complex concepts in a way that just clicks. My A-Level grade went from a C to an A* after working with her for three months.',
      },
      {
        id: 'r2',
        studentName: 'Priya M.',
        studentInitials: 'PM',
        rating: 5,
        date: '1 month ago',
        comment: 'Incredibly patient and knowledgeable. She always comes prepared with practice problems tailored to my weak areas. Highly recommend!',
      },
      {
        id: 'r3',
        studentName: 'Daniel W.',
        studentInitials: 'DW',
        rating: 4,
        date: '2 months ago',
        comment: 'Great tutor with a deep understanding of the subject. Very thorough in her explanations and always available for follow-up questions.',
      },
    ],
  },
  '2': {
    id: '2',
    name: 'James Okafor',
    initials: 'JO',
    avatarColor: '#2563EB',
    headline: 'Physics teacher specialising in exam preparation',
    bio: 'As a dedicated physics educator, I bring real-world applications into every lesson. I have helped hundreds of students achieve top grades in GCSE and A-Level Physics. My lessons are interactive, filled with demonstrations and practical problem-solving to make abstract concepts tangible.',
    subjects: ['Physics'],
    levels: ['GCSE', 'A-Level'],
    qualifications: [
      'MSc Physics, Imperial College London',
      'PGCE Science Education',
      'BSc Physics, University of Lagos',
    ],
    rating: 4.8,
    reviewCount: 93,
    hourlyRate: 55,
    lessonsCompleted: 614,
    responseTime: '< 2 hours',
    reviews: [
      {
        id: 'r1',
        studentName: 'Sophie L.',
        studentInitials: 'SL',
        rating: 5,
        date: '1 week ago',
        comment: 'James makes physics so fun and easy to understand. His exam tips are absolutely invaluable.',
      },
      {
        id: 'r2',
        studentName: 'Tom B.',
        studentInitials: 'TB',
        rating: 5,
        date: '3 weeks ago',
        comment: 'Best physics tutor I have ever had. He really knows how to break down complicated topics.',
      },
    ],
  },
};

// Default profile for tutors not in the detailed map
const DEFAULT_PROFILE: TutorProfile = {
  id: '0',
  name: 'Tutor',
  initials: 'T',
  avatarColor: '#7C3AED',
  headline: 'Experienced tutor',
  bio: 'A dedicated educator committed to helping students reach their full potential through personalised instruction and support.',
  subjects: ['General'],
  levels: ['GCSE', 'A-Level'],
  qualifications: ['Qualified Teacher Status'],
  rating: 4.5,
  reviewCount: 30,
  hourlyRate: 45,
  lessonsCompleted: 200,
  responseTime: '< 3 hours',
  reviews: [
    {
      id: 'r1',
      studentName: 'Student A.',
      studentInitials: 'SA',
      rating: 5,
      date: '1 week ago',
      comment: 'A fantastic tutor who always goes above and beyond.',
    },
  ],
};

export default function TutorProfileScreen({ route, navigation }: any) {
  const tutorId = route?.params?.tutorId ?? '1';
  const tutor = TUTOR_PROFILES[tutorId] ?? DEFAULT_PROFILE;

  const renderStars = (rating: number, size = 16) => {
    const stars = [];
    const full = Math.floor(rating);
    const hasHalf = rating - full >= 0.5;
    for (let i = 0; i < full; i++) {
      stars.push(<Ionicons key={`full-${i}`} name="star" size={size} color="#F59E0B" />);
    }
    if (hasHalf) {
      stars.push(<Ionicons key="half" name="star-half" size={size} color="#F59E0B" />);
    }
    const empty = 5 - full - (hasHalf ? 1 : 0);
    for (let i = 0; i < empty; i++) {
      stars.push(
        <Ionicons key={`empty-${i}`} name="star-outline" size={size} color="#F59E0B" />
      );
    }
    return stars;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.navBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Tutor Profile</Text>
        <View style={styles.navSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={[styles.avatarLarge, { backgroundColor: tutor.avatarColor }]}>
            <Text style={styles.avatarLargeText}>{tutor.initials}</Text>
          </View>
          <Text style={styles.profileName}>{tutor.name}</Text>
          <Text style={styles.profileHeadline}>{tutor.headline}</Text>
          <View style={styles.ratingRow}>
            <View style={styles.stars}>{renderStars(tutor.rating)}</View>
            <Text style={styles.ratingValue}>{tutor.rating}</Text>
            <Text style={styles.ratingCount}>({tutor.reviewCount} reviews)</Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{tutor.lessonsCompleted}</Text>
            <Text style={styles.statLabel}>Lessons</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>${tutor.hourlyRate}</Text>
            <Text style={styles.statLabel}>Per Hour</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{tutor.responseTime}</Text>
            <Text style={styles.statLabel}>Response</Text>
          </View>
        </View>

        {/* Bio */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.bioText}>{tutor.bio}</Text>
        </View>

        {/* Qualifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Qualifications</Text>
          {tutor.qualifications.map((qual, index) => (
            <View key={index} style={styles.qualRow}>
              <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
              <Text style={styles.qualText}>{qual}</Text>
            </View>
          ))}
        </View>

        {/* Subjects */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subjects</Text>
          <View style={styles.tagRow}>
            {tutor.subjects.map((subject) => (
              <View key={subject} style={styles.subjectTag}>
                <Text style={styles.subjectTagText}>{subject}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Levels */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Levels</Text>
          <View style={styles.tagRow}>
            {tutor.levels.map((level) => (
              <View key={level} style={styles.levelTag}>
                <Text style={styles.levelTagText}>{level}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Reviews */}
        <View style={styles.section}>
          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            <Text style={styles.reviewsCount}>{tutor.reviewCount} total</Text>
          </View>
          {tutor.reviews.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewTop}>
                <View style={styles.reviewerAvatar}>
                  <Text style={styles.reviewerInitials}>{review.studentInitials}</Text>
                </View>
                <View style={styles.reviewerInfo}>
                  <Text style={styles.reviewerName}>{review.studentName}</Text>
                  <Text style={styles.reviewDate}>{review.date}</Text>
                </View>
                <View style={styles.reviewStars}>{renderStars(review.rating, 12)}</View>
              </View>
              <Text style={styles.reviewComment}>{review.comment}</Text>
            </View>
          ))}
        </View>

        {/* Bottom spacer for fixed button */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Fixed Book Button */}
      <View style={styles.bookButtonContainer}>
        <TouchableOpacity style={styles.bookButton} activeOpacity={0.8}>
          <Ionicons name="calendar" size={20} color={Colors.white} />
          <Text style={styles.bookButtonText}>Book a Lesson</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  navTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '600',
    color: Colors.text,
  },
  navSpacer: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  profileHeader: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 24,
  },
  avatarLarge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarLargeText: {
    fontSize: 34,
    fontWeight: '700',
    color: Colors.white,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
  },
  profileHeadline: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  ratingCount: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 16,
    paddingVertical: 18,
    marginBottom: 24,
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
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  bioText: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  qualRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  qualText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  subjectTag: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  subjectTagText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  levelTag: {
    backgroundColor: Colors.card,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  levelTagText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewsCount: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  reviewCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  reviewTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  reviewerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  reviewerInitials: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  reviewDate: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 1,
  },
  reviewComment: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  bottomSpacer: {
    height: 100,
  },
  bookButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  bookButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
    ...Platform.select({
      ios: {
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  bookButtonText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: '700',
  },
});
