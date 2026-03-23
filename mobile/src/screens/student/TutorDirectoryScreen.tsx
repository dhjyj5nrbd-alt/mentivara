import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';

interface Tutor {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  headline: string;
  subjects: string[];
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  level: string;
}

const TUTORS: Tutor[] = [
  {
    id: '1',
    name: 'Dr. Sarah Chen',
    initials: 'SC',
    avatarColor: '#7C3AED',
    headline: 'Oxford-trained mathematician with 10+ years of experience',
    subjects: ['Mathematics', 'Further Maths'],
    rating: 4.9,
    reviewCount: 127,
    hourlyRate: 65,
    level: 'A-Level',
  },
  {
    id: '2',
    name: 'James Okafor',
    initials: 'JO',
    avatarColor: '#2563EB',
    headline: 'Physics teacher specialising in exam preparation',
    subjects: ['Physics'],
    rating: 4.8,
    reviewCount: 93,
    hourlyRate: 55,
    level: 'GCSE',
  },
  {
    id: '3',
    name: 'Emily Hart',
    initials: 'EH',
    avatarColor: '#DC2626',
    headline: 'Published author and English literature specialist',
    subjects: ['English Literature', 'English Language'],
    rating: 4.9,
    reviewCount: 84,
    hourlyRate: 50,
    level: 'A-Level',
  },
  {
    id: '4',
    name: 'Dr. Raj Patel',
    initials: 'RP',
    avatarColor: '#059669',
    headline: 'Former university lecturer in organic chemistry',
    subjects: ['Chemistry', 'Biology'],
    rating: 4.7,
    reviewCount: 68,
    hourlyRate: 60,
    level: 'A-Level',
  },
  {
    id: '5',
    name: 'Maria Rodriguez',
    initials: 'MR',
    avatarColor: '#EA580C',
    headline: 'Bilingual tutor for Spanish and French',
    subjects: ['Spanish', 'French'],
    rating: 4.8,
    reviewCount: 112,
    hourlyRate: 45,
    level: 'GCSE',
  },
  {
    id: '6',
    name: 'Prof. David Kim',
    initials: 'DK',
    avatarColor: '#0891B2',
    headline: 'Computer science expert and AI researcher',
    subjects: ['Computer Science'],
    rating: 5.0,
    reviewCount: 56,
    hourlyRate: 70,
    level: 'A-Level',
  },
  {
    id: '7',
    name: 'Amara Johnson',
    initials: 'AJ',
    avatarColor: '#D946EF',
    headline: 'Passionate history tutor bringing the past to life',
    subjects: ['History', 'Politics'],
    rating: 4.6,
    reviewCount: 41,
    hourlyRate: 45,
    level: 'GCSE',
  },
  {
    id: '8',
    name: 'Dr. Liam O\'Brien',
    initials: 'LO',
    avatarColor: '#CA8A04',
    headline: 'Biology PhD with hands-on lab experience',
    subjects: ['Biology'],
    rating: 4.8,
    reviewCount: 79,
    hourlyRate: 55,
    level: 'A-Level',
  },
];

const SUBJECT_FILTERS = ['All', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Languages', 'Computer Science', 'History'];
const LEVEL_FILTERS = ['All', 'GCSE', 'A-Level', 'IB', 'University'];

export default function TutorDirectoryScreen({ navigation }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');

  const filteredTutors = useMemo(() => {
    return TUTORS.filter((tutor) => {
      const matchesSearch =
        searchQuery === '' ||
        tutor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tutor.subjects.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesSubject =
        selectedSubject === 'All' ||
        tutor.subjects.some((s) => s.toLowerCase().includes(selectedSubject.toLowerCase()));

      const matchesLevel =
        selectedLevel === 'All' || tutor.level === selectedLevel;

      return matchesSearch && matchesSubject && matchesLevel;
    });
  }, [searchQuery, selectedSubject, selectedLevel]);

  const renderStars = (rating: number) => {
    const stars = [];
    const full = Math.floor(rating);
    const hasHalf = rating - full >= 0.5;
    for (let i = 0; i < full; i++) {
      stars.push(<Ionicons key={`full-${i}`} name="star" size={14} color="#F59E0B" />);
    }
    if (hasHalf) {
      stars.push(<Ionicons key="half" name="star-half" size={14} color="#F59E0B" />);
    }
    return stars;
  };

  const renderTutorCard = ({ item }: { item: Tutor }) => (
    <TouchableOpacity
      style={styles.tutorCard}
      activeOpacity={0.7}
      onPress={() => navigation.navigate('TutorProfile', { tutorId: item.id })}
    >
      <View style={styles.tutorCardTop}>
        <View style={[styles.avatar, { backgroundColor: item.avatarColor }]}>
          <Text style={styles.avatarText}>{item.initials}</Text>
        </View>
        <View style={styles.tutorInfo}>
          <Text style={styles.tutorName}>{item.name}</Text>
          <Text style={styles.tutorHeadline} numberOfLines={2}>
            {item.headline}
          </Text>
        </View>
      </View>

      <View style={styles.subjectRow}>
        {item.subjects.map((subject) => (
          <View key={subject} style={styles.subjectTag}>
            <Text style={styles.subjectTagText}>{subject}</Text>
          </View>
        ))}
      </View>

      <View style={styles.tutorCardBottom}>
        <View style={styles.ratingRow}>
          <View style={styles.stars}>{renderStars(item.rating)}</View>
          <Text style={styles.ratingText}>{item.rating}</Text>
          <Text style={styles.reviewCount}>({item.reviewCount})</Text>
        </View>
        <Text style={styles.hourlyRate}>${item.hourlyRate}/hr</Text>
      </View>

      <TouchableOpacity
        style={styles.viewProfileButton}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('TutorProfile', { tutorId: item.id })}
      >
        <Text style={styles.viewProfileText}>View Profile</Text>
        <Ionicons name="arrow-forward" size={16} color={Colors.primary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Find a Tutor</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or subject..."
          placeholderTextColor={Colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filterSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {SUBJECT_FILTERS.map((subject) => (
            <TouchableOpacity
              key={subject}
              style={[
                styles.filterChip,
                selectedSubject === subject && styles.filterChipActive,
              ]}
              onPress={() => setSelectedSubject(subject)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedSubject === subject && styles.filterChipTextActive,
                ]}
              >
                {subject}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {LEVEL_FILTERS.map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.filterChip,
                selectedLevel === level && styles.filterChipActive,
              ]}
              onPress={() => setSelectedLevel(level)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedLevel === level && styles.filterChipTextActive,
                ]}
              >
                {level}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredTutors}
        keyExtractor={(item) => item.id}
        renderItem={renderTutorCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color={Colors.border} />
            <Text style={styles.emptyText}>No tutors found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
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
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    marginHorizontal: 20,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    padding: 0,
  },
  filterSection: {
    marginTop: 12,
    gap: 8,
    marginBottom: 8,
  },
  filterRow: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: Colors.white,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 100,
  },
  tutorCard: {
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
  tutorCardTop: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
  },
  tutorInfo: {
    flex: 1,
  },
  tutorName: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  tutorHeadline: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  subjectRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  subjectTag: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  subjectTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  tutorCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  hourlyRate: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
  },
  viewProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  viewProfileText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 8,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
