import React from 'react';
import { StyleSheet, Text } from 'react-native';

import ProfileSubpageLayout, { ProfileInfoParagraph } from '../components/ProfileSubpageLayout';

const TEXT_DARK = '#111827';

export default function PrivacySettingsScreen() {
  return (
    <ProfileSubpageLayout title="Privacy & Settings">
      <Text style={styles.lead}>Privacy & Settings</Text>
      <ProfileInfoParagraph>
        This page is where you manage privacy and account preferences for the parent
        portal.
      </ProfileInfoParagraph>
      <ProfileInfoParagraph>
        You can review how your information is used, control photo and message sharing
        with your daycare, and update security-related options when they become
        available.
      </ProfileInfoParagraph>
      <ProfileInfoParagraph>
        More privacy controls will be added here soon. If you have questions about your
        data, contact your daycare center directly.
      </ProfileInfoParagraph>
    </ProfileSubpageLayout>
  );
}

const styles = StyleSheet.create({
  lead: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT_DARK,
    marginBottom: 12,
  },
});
