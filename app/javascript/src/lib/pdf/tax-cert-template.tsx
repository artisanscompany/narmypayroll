import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { User } from '#/types/user'

const styles = StyleSheet.create({
  page: { padding: 50, fontFamily: 'Helvetica', fontSize: 10 },
  border: { borderWidth: 2, borderColor: '#0B2E1A', padding: 30 },
  header: { textAlign: 'center' as const, marginBottom: 24 },
  star: { fontSize: 32, color: '#C8A84B', fontFamily: 'Helvetica-Bold', textAlign: 'center' as const },
  title: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: '#0B2E1A', textAlign: 'center' as const, marginTop: 8 },
  subtitle: { fontSize: 11, color: '#666', textAlign: 'center' as const, marginTop: 4 },
  certNo: { fontSize: 9, color: '#999', textAlign: 'center' as const, marginTop: 8, fontFamily: 'Courier' },
  body: { marginTop: 20, lineHeight: 1.8 },
  paragraph: { fontSize: 11, color: '#374151', marginBottom: 8 },
  infoRow: { flexDirection: 'row', marginBottom: 4 },
  infoLabel: { width: 140, fontSize: 10, color: '#666' },
  infoValue: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#0B2E1A' },
  footer: { marginTop: 40, borderTopWidth: 1, borderTopColor: '#e5e5e5', paddingTop: 12, textAlign: 'center' as const },
  footerText: { fontSize: 8, color: '#999' },
})

export function TaxCertPDF({ user, taxYear }: { user: User; taxYear: number }) {
  const certNumber = `TC-${user.armyNumber.replace(/\//g, '')}-${taxYear}`

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.border}>
          <View style={styles.header}>
            <Text style={styles.star}>★</Text>
            <Text style={styles.title}>TAX EXEMPTION CERTIFICATE</Text>
            <Text style={styles.subtitle}>Nigerian Army — Personnel Division</Text>
            <Text style={styles.certNo}>Certificate No: {certNumber}</Text>
          </View>

          <View style={styles.body}>
            <Text style={styles.paragraph}>
              This is to certify that the below-named personnel of the Nigerian Army is exempt from certain
              taxes in accordance with the Armed Forces Tax Exemption Act.
            </Text>

            <View style={{ marginTop: 16, marginBottom: 16 }}>
              <View style={styles.infoRow}><Text style={styles.infoLabel}>Full Name:</Text><Text style={styles.infoValue}>{user.name}</Text></View>
              <View style={styles.infoRow}><Text style={styles.infoLabel}>Army Number:</Text><Text style={styles.infoValue}>{user.armyNumber}</Text></View>
              <View style={styles.infoRow}><Text style={styles.infoLabel}>Rank:</Text><Text style={styles.infoValue}>{user.rank}</Text></View>
              <View style={styles.infoRow}><Text style={styles.infoLabel}>Division:</Text><Text style={styles.infoValue}>{user.division}</Text></View>
              <View style={styles.infoRow}><Text style={styles.infoLabel}>Tax Year:</Text><Text style={styles.infoValue}>{taxYear}</Text></View>
              <View style={styles.infoRow}><Text style={styles.infoLabel}>Exemption Basis:</Text><Text style={styles.infoValue}>Active Military Service</Text></View>
            </View>

            <Text style={styles.paragraph}>
              This certificate is valid for the tax year {taxYear} and is issued for official use only.
            </Text>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Authorized for official use — Nigerian Army Personnel Division</Text>
            <Text style={styles.footerText}>Generated via Personnel Self-Service Portal</Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}
