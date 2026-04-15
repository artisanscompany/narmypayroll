import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { Payslip } from '#/types/payslip'
import type { User } from '#/types/user'

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, borderBottomWidth: 2, borderBottomColor: '#0B2E1A', paddingBottom: 12 },
  headerLeft: {},
  title: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: '#0B2E1A' },
  subtitle: { fontSize: 9, color: '#666', marginTop: 2 },
  star: { fontSize: 24, color: '#C8A84B', fontFamily: 'Helvetica-Bold' },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#0B2E1A', marginBottom: 8, textTransform: 'uppercase' as const, letterSpacing: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, borderBottomWidth: 0.5, borderBottomColor: '#e5e5e5' },
  label: { fontSize: 10, color: '#374151' },
  value: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#0B2E1A' },
  deductionValue: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#dc2626' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, backgroundColor: '#0B2E1A', paddingHorizontal: 8, borderRadius: 4, marginTop: 8 },
  totalLabel: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: '#ffffff' },
  totalValue: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: '#C8A84B' },
  footer: { position: 'absolute' as const, bottom: 30, left: 40, right: 40, textAlign: 'center' as const, fontSize: 8, color: '#999', borderTopWidth: 0.5, borderTopColor: '#e5e5e5', paddingTop: 8 },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap' as const, gap: 12 },
  infoItem: { width: '48%', marginBottom: 6 },
  infoLabel: { fontSize: 8, color: '#999', textTransform: 'uppercase' as const, letterSpacing: 0.5 },
  infoValue: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#0B2E1A', marginTop: 1 },
})

const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export function PayslipPDF({ payslip, user }: { payslip: Payslip; user: User }) {
  const earnings = payslip.components.filter((c) => c.type === 'earning')
  const deductions = payslip.components.filter((c) => c.type === 'deduction')

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>NIGERIAN ARMY — PAYSLIP</Text>
            <Text style={styles.subtitle}>{monthNames[payslip.month]} {payslip.year}</Text>
          </View>
          <Text style={styles.star}>★</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personnel Details</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}><Text style={styles.infoLabel}>Name</Text><Text style={styles.infoValue}>{user.name}</Text></View>
            <View style={styles.infoItem}><Text style={styles.infoLabel}>Army Number</Text><Text style={styles.infoValue}>{user.armyNumber}</Text></View>
            <View style={styles.infoItem}><Text style={styles.infoLabel}>Rank</Text><Text style={styles.infoValue}>{user.rank}</Text></View>
            <View style={styles.infoItem}><Text style={styles.infoLabel}>Division</Text><Text style={styles.infoValue}>{user.division}</Text></View>
            <View style={styles.infoItem}><Text style={styles.infoLabel}>Grade Level</Text><Text style={styles.infoValue}>{user.gradeLevel}, Step {user.step}</Text></View>
            <View style={styles.infoItem}><Text style={styles.infoLabel}>Corps</Text><Text style={styles.infoValue}>{user.corps}</Text></View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Earnings</Text>
          {earnings.map((c) => (
            <View key={c.label} style={styles.row}>
              <Text style={styles.label}>{c.label}</Text>
              <Text style={styles.value}>₦{c.amount.toLocaleString()}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Deductions</Text>
          {deductions.map((c) => (
            <View key={c.label} style={styles.row}>
              <Text style={styles.label}>{c.label}</Text>
              <Text style={styles.deductionValue}>-₦{c.amount.toLocaleString()}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Net Pay</Text>
          <Text style={styles.totalValue}>₦{payslip.netPay.toLocaleString()}</Text>
        </View>

        <Text style={styles.footer}>This is a computer-generated document. Nigerian Army Personnel Self-Service Portal.</Text>
      </Page>
    </Document>
  )
}
