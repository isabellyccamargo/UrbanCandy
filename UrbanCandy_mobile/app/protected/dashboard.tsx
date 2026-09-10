import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, SafeAreaView, Dimensions } from 'react-native';
import Svg, { Polyline, Circle, Line, Text as SvgText } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/Theme';
import { Menu } from '@/components/home/Menu';
import EmployeeHeader from '@/components/employee/EmployeeHeader';
import api from '@/services/api';
import { getAllProducts } from '@/services/products';
import { getAllOrders } from '@/services/orders';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function DashboardScreen() {
    const { user } = useAuth();
    const { colors, font, fontSize, radius, space, sizes } = useTheme();

    const [loading, setLoading] = useState(true);
    const [monthlyData, setMonthlyData] = useState<any[]>([]);
    const [topProducts, setTopProducts] = useState<any[]>([]);
    const [metrics, setMetrics] = useState({ faturamentoTotal: 0, totalPedidos: 0, totalProdutos: 0, totalClientes: 0 });

    useEffect(() => {
        async function fetchRealData() {
            try {
                setLoading(true);
                const [resProds, resOrders, resUsers] = await Promise.allSettled([
                    getAllProducts(1, 100),
                    getAllOrders(1, 200),
                    api.get('/usuario/listar').catch(() => api.get('/pessoa/listar')).catch(() => api.get('/usuario/listarPorId/1')),
                ]);

                // 1. Produtos
                let totalProds = 0;
                const productsMap = new Map();
                if (resProds.status === 'fulfilled' && resProds.value) {
                    const data = resProds.value;
                    const arr = Array.isArray(data) ? data : (Array.isArray(data.data) ? data.data : (data.produtos || []));
                    totalProds = data.totalItems ?? data.total ?? arr.length;
                    arr.forEach((p: any) => productsMap.set(p.id_product || p.id || p.id_produto, p.name || p.nome || p.title));
                }

                // 2. Meses do Gráfico
                const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
                const currentDate = new Date();
                const last4Months = Array.from({ length: 4 }, (_, i) => {
                    const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - (3 - i), 1);
                    return { label: months[d.getMonth()], monthIndex: d.getMonth(), year: d.getFullYear(), total: 0 };
                });

                // 3. Pedidos e Top 3
                let totalOrdersCount = 0, totalVendasCalculado = 0;
                const clientesSet = new Set<number>();
                const productSalesCount = new Map();

                if (resOrders.status === 'fulfilled' && resOrders.value) {
                    const data = resOrders.value;
                    const arr = Array.isArray(data) ? data : (Array.isArray(data.data) ? data.data : (data.pedidos || []));
                    totalOrdersCount = data.totalItems ?? data.total ?? arr.length;

                    arr.forEach((curr: any) => {
                        if (curr.id_people) clientesSet.add(curr.id_people);
                        if (curr.id_user) clientesSet.add(curr.id_user);

                        const val = Number(curr.total ?? curr.valor_total ?? curr.valorTotal ?? 0) || 0;
                        totalVendasCalculado += val;

                        const rawDate = curr.order_date || curr.created_at || curr.createdAt || curr.data;
                        if (rawDate) {
                            const orderDate = new Date(rawDate);
                            if (!isNaN(orderDate.getTime())) {
                                const mObj = last4Months.find(m => m.monthIndex === orderDate.getMonth() && m.year === orderDate.getFullYear());
                                if (mObj) mObj.total += val;
                            }
                        }

                        const items = curr.items || curr.produtos || curr.order_items || [];
                        if (Array.isArray(items)) {
                            items.forEach((item: any) => {
                                const prodId = item.id_product || item.product_id || item.id_produto || item.id;
                                const name = item.name || item.nome || productsMap.get(prodId) || `Produto #${prodId}`;
                                const qty = Number(item.quantity || item.quantidade || item.qty || 1);
                                const total = Number(item.total || item.price || 0) * qty;

                                if (prodId) {
                                    const ex = productSalesCount.get(prodId) || { name, quantity: 0, totalAmount: 0 };
                                    productSalesCount.set(prodId, { name, quantity: ex.quantity + qty, totalAmount: ex.totalAmount + total });
                                }
                            });
                        }
                    });
                }

                // 4. Clientes
                let totalUsersCount = 0;
                if (resUsers.status === 'fulfilled' && resUsers.value?.data) {
                    const d = resUsers.value.data;
                    totalUsersCount = d.totalItems ?? d.total ?? (Array.isArray(d.data) ? d.data.length : (Array.isArray(d) ? d.length : 0));
                }

                setTopProducts(Array.from(productSalesCount.entries()).map(([id, info]) => ({ id, ...info })).sort((a, b) => b.quantity - a.quantity).slice(0, 3));
                setMonthlyData(last4Months);
                setMetrics({ faturamentoTotal: totalVendasCalculado, totalPedidos: totalOrdersCount, totalProdutos: totalProds, totalClientes: totalUsersCount || clientesSet.size });
            } catch (err) {
                console.error('[DASHBOARD] Erro:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchRealData();
    }, []);

    // SVG Layout
    const svgWidth = SCREEN_WIDTH - 64, svgHeight = 150, paddingX = 35, paddingY = 25;
    const maxSales = Math.max(...monthlyData.map(m => m.total), 10);
    const availableWidth = svgWidth - paddingX * 2, availableHeight = svgHeight - paddingY * 2;
    const points = monthlyData.map((m, i) => ({
        x: paddingX + (i * (availableWidth / (monthlyData.length - 1 || 1))),
        y: svgHeight - paddingY - ((m.total / maxSales) * availableHeight),
        label: m.label,
        total: m.total
    }));

    const userName = user?.nome || (user as any)?.name;

    return (
        <View style={styles.safeArea}>
            {/* Header posicionado de ponta a ponta no topo (antes do ScrollView) */}
            <EmployeeHeader employeeName={userName} />

            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: sizes.bottomMenuHeight + 20 }} showsVerticalScrollIndicator={false}>
                <View style={{ padding: space.md }}>
                    <Text style={[styles.title, { color: colors.text, fontFamily: font.bold }]}>Dashboard</Text>

                    {loading ? (
                        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
                    ) : (
                        <>
                            {/* Cards de Métricas */}
                            <View style={styles.cardsGrid}>
                                {[
                                    { title: 'Faturamento Total', value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metrics.faturamentoTotal), icon: 'cash-outline' },
                                    { title: 'Total de Pedidos', value: metrics.totalPedidos, icon: 'bag-handle-outline' },
                                    { title: 'Total de Produtos', value: metrics.totalProdutos, icon: 'cube-outline' },
                                    { title: 'Total de Clientes', value: metrics.totalClientes, icon: 'person-outline' },
                                ].map((c, i) => (
                                    <View key={i} style={[styles.card, { backgroundColor: colors.white, borderRadius: radius.md }]}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                            <Text style={{ fontSize: fontSize.xs, color: colors.text, flex: 1 }}>{c.title}</Text>
                                            <Ionicons name={c.icon as any} size={20} color={colors.text} />
                                        </View>
                                        <Text style={{ fontSize: fontSize.md, fontFamily: font.bold, color: colors.text, marginTop: 4 }}>{c.value}</Text>
                                    </View>
                                ))}
                            </View>

                            {/* Banner de Aviso: Gestão via Web */}
                            <View style={{
                                backgroundColor: '#FFF8E1',
                                borderColor: '#FFE082',
                                borderWidth: 1,
                                borderRadius: radius.md,
                                padding: space.sm,
                                marginTop: 15,
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 10
                            }}>
                                <Ionicons name="desktop-outline" size={24} color="#F57F17" />
                                <Text style={{ flex: 1, fontSize: fontSize.xs, color: '#5D4037', lineHeight: 18 }}>
                                    <Text style={{ fontFamily: font.bold, color: '#E65100' }}>Atenção:</Text> Para cadastrar, editar ou excluir produtos, categorias, usuários ou outros itens, acesse o <Text style={{ fontFamily: font.bold }}>Painel Web</Text> pelo seu computador.
                                </Text>
                            </View>

                            {/* Caixa de Bem-Vindo */}
                            <View style={[styles.sectionBox, { backgroundColor: '#EAC8DB', borderRadius: radius.lg }]}>
                                <Text style={[styles.sectionTitle, { color: '#D81B60', fontFamily: font.bold, fontSize: fontSize.md }]}>
                                    Bem-vindo ao Painel Administrativo
                                </Text>
                                <Text style={{ fontSize: fontSize.sm, color: '#88123B', lineHeight: 20, marginTop: 6 }}>
                                    A <Text style={{ fontFamily: font.bold, color: '#D81B60' }}>UrbanCandy</Text> nasceu para espalhar doçura. Acompanhe abaixo o desempenho real de vendas e os produtos campeões da sua loja! 🍬✨
                                </Text>
                            </View>

                            {/* Gráfico de Linha */}
                            <View style={[styles.sectionBox, { backgroundColor: colors.white, borderRadius: radius.lg }]}>
                                <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: font.bold, fontSize: fontSize.md }]}>Evolução das Vendas</Text>
                                <Text style={{ fontSize: fontSize.xs, color: '#888', marginBottom: 12 }}>Faturamento mensal (últimos 4 meses)</Text>

                                <Svg width={svgWidth} height={svgHeight}>
                                    <Line x1={paddingX - 10} y1={svgHeight - paddingY} x2={svgWidth - paddingX + 10} y2={svgHeight - paddingY} stroke="#E0E0E0" strokeWidth="1.5" />
                                    <Polyline points={points.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke={colors.primary || '#D81B60'} strokeWidth="3" />
                                    {points.map((p, idx) => (
                                        <React.Fragment key={idx}>
                                            <SvgText x={p.x} y={p.y - 10} fill="#444" fontSize="10" fontWeight="bold" textAnchor="middle">
                                                {p.total >= 1000 ? `R$${(p.total / 1000).toFixed(1)}k` : `R$${p.total.toFixed(0)}`}
                                            </SvgText>
                                            <Circle cx={p.x} cy={p.y} r="5" fill={colors.primary || '#D81B60'} stroke="#FFF" strokeWidth="2" />
                                            <SvgText x={p.x} y={svgHeight - 6} fill="#666" fontSize="11" textAnchor="middle">{p.label}</SvgText>
                                        </React.Fragment>
                                    ))}
                                </Svg>
                            </View>

                            {/* Top 3 Produtos */}
                            <View style={[styles.sectionBox, { backgroundColor: colors.white, borderRadius: radius.lg }]}>
                                <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: font.bold, fontSize: fontSize.md }]}>Top 3 Produtos Mais Vendidos</Text>
                                <Text style={{ fontSize: fontSize.xs, color: '#888', marginBottom: 8 }}>Campeões de vendas da loja</Text>

                                {topProducts.length > 0 ? (
                                    topProducts.map((p, i) => (
                                        <View key={p.id || i} style={styles.topItem}>
                                            <Text style={{ fontSize: 20, marginRight: 10 }}>{['🥇', '🥈', '🥉'][i] || '⭐'}</Text>
                                            <View style={{ flex: 1 }}>
                                                <Text style={{ fontSize: fontSize.sm, fontFamily: font.bold, color: colors.text }}>{p.name}</Text>
                                                {p.totalAmount > 0 && <Text style={{ fontSize: fontSize.xs, color: '#666' }}>R$ {p.totalAmount.toFixed(2)} acumulados</Text>}
                                            </View>
                                            <View style={styles.badge}>
                                                <Text style={{ fontSize: fontSize.xs, fontFamily: font.bold, color: '#D81B60' }}>{p.quantity} un</Text>
                                            </View>
                                        </View>
                                    ))
                                ) : (
                                    <Text style={{ fontSize: fontSize.sm, color: '#888', textAlign: 'center', marginVertical: 8 }}>Nenhum item contabilizado ainda.</Text>
                                )}
                            </View>
                        </>
                    )}
                </View>
            </ScrollView>
            <Menu />
        </View>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F5F5F5' },
    title: { fontSize: 24, marginVertical: 8, marginBottom: 16 },
    cardsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10 },
    card: { width: '48%', padding: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, minHeight: 80, justifyContent: 'space-between' },
    sectionBox: { padding: 16, marginTop: 14, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4 },
    sectionTitle: { marginBottom: 2 },
    topItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    badge: { backgroundColor: '#EAC8DB', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }
});