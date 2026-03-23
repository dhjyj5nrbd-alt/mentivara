import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Switch,
  Alert,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { useAuth } from '../../store/authStore';

interface MenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

export default function MoreScreen() {
  const { logout } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [currency, setCurrency] = useState('GBP');

  const showComingSoon = (feature: string) => {
    Alert.alert(
      'Coming Soon',
      `${feature} is coming soon in the mobile app.`,
      [{ text: 'OK', style: 'default' }]
    );
  };

  const showCurrencyPicker = () => {
    Alert.alert(
      'Select Currency',
      'Choose your preferred currency',
      [
        { text: 'GBP (\u00A3)', onPress: () => setCurrency('GBP') },
        { text: 'USD ($)', onPress: () => setCurrency('USD') },
        { text: 'EUR (\u20AC)', onPress: () => setCurrency('EUR') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: logout },
      ]
    );
  };

  const sections: MenuSection[] = [
    {
      title: 'Learning',
      items: [
        { icon: 'document-text-outline', label: 'Exam Simulator', onPress: () => showComingSoon('Exam Simulator') },
        { icon: 'git-network-outline', label: 'Knowledge Map', onPress: () => showComingSoon('Knowledge Map') },
        { icon: 'chatbubble-ellipses-outline', label: 'AI Doubt Solver', onPress: () => showComingSoon('AI Doubt Solver') },
        { icon: 'rocket-outline', label: 'Study Missions', onPress: () => showComingSoon('Study Missions') },
        { icon: 'book-outline', label: 'My Syllabus', onPress: () => showComingSoon('My Syllabus') },
      ],
    },
    {
      title: 'Community',
      items: [
        { icon: 'people-outline', label: 'Student Forum', onPress: () => showComingSoon('Student Forum') },
        { icon: 'people-circle-outline', label: 'Study Groups', onPress: () => showComingSoon('Study Groups') },
        { icon: 'videocam-outline', label: 'Tutor Reels', onPress: () => showComingSoon('Tutor Reels') },
        { icon: 'trophy-outline', label: 'Competitions', onPress: () => showComingSoon('Competitions') },
      ],
    },
    {
      title: 'Account',
      items: [
        { icon: 'card-outline', label: 'Payments', onPress: () => showComingSoon('Payments') },
        { icon: 'sparkles-outline', label: 'AI Study Coach', onPress: () => showComingSoon('AI Study Coach') },
        { icon: 'analytics-outline', label: 'Study Optimizer', onPress: () => showComingSoon('Study Optimizer') },
        { icon: 'settings-outline', label: 'Settings', onPress: () => showComingSoon('Settings') },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="grid-outline" size={28} color={Colors.primary} />
          <Text style={styles.headerTitle}>More</Text>
        </View>

        {/* Menu Sections */}
        {sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item, index) => (
                <TouchableOpacity
                  key={item.label}
                  style={[
                    styles.menuItem,
                    index === section.items.length - 1 && styles.menuItemLast,
                  ]}
                  onPress={item.onPress}
                  activeOpacity={0.6}
                >
                  <View style={styles.menuItemLeft}>
                    <View style={styles.menuIconWrap}>
                      <Ionicons name={item.icon} size={20} color={Colors.primary} />
                    </View>
                    <Text style={styles.menuItemLabel}>{item.label}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Other Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Other</Text>
          <View style={styles.sectionCard}>
            {/* Dark Mode Toggle */}
            <View style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIconWrap}>
                  <Ionicons name="moon-outline" size={20} color={Colors.primary} />
                </View>
                <Text style={styles.menuItemLabel}>Dark Mode</Text>
              </View>
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: Colors.border, true: Colors.primaryLight }}
                thumbColor={darkMode ? Colors.primary : '#f4f3f4'}
              />
            </View>

            {/* Currency Selector */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={showCurrencyPicker}
              activeOpacity={0.6}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIconWrap}>
                  <Ionicons name="cash-outline" size={20} color={Colors.primary} />
                </View>
                <Text style={styles.menuItemLabel}>Currency</Text>
              </View>
              <View style={styles.currencyBadge}>
                <Text style={styles.currencyText}>{currency}</Text>
                <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
              </View>
            </TouchableOpacity>

            {/* Sign Out */}
            <TouchableOpacity
              style={[styles.menuItem, styles.menuItemLast]}
              onPress={handleSignOut}
              activeOpacity={0.6}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconWrap, { backgroundColor: '#FEE2E2' }]}>
                  <Ionicons name="log-out-outline" size={20} color={Colors.error} />
                </View>
                <Text style={[styles.menuItemLabel, { color: Colors.error }]}>Sign Out</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* App Version */}
        <Text style={styles.version}>Mentivara v1.0.0</Text>

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
    gap: 10,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  currencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  currencyText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  version: {
    textAlign: 'center',
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginTop: 8,
  },
});
