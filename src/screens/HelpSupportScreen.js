import React from 'react';
import { StyleSheet, Text } from 'react-native';

import ProfileSubpageLayout, { ProfileInfoParagraph } from '../components/ProfileSubpageLayout';

const TEXT_DARK = '#111827';

export default function HelpSupportScreen() {
  return (
    <ProfileSubpageLayout title="Help & Support">
      <Text style={styles.lead}>Help & Support</Text>
      <ProfileInfoParagraph>
        Welcome to Help & Support. This section is here to help you get the most out of
        the parent app.
      </ProfileInfoParagraph>
      <ProfileInfoParagraph>
        For questions about your child's schedule, billing, or classroom updates,
        please reach out to your daycare center's front desk or your child's teacher.
      </ProfileInfoParagraph>
      <ProfileInfoParagraph>
        FAQs, in-app messaging with support, and troubleshooting guides will be added
        here in a future update. Thank you for using the parent portal.
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
