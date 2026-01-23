import { Box, Flex, Text, SimpleGrid, VStack } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { PageHeader, StatCard, ActionButton, NFTImage } from '../components/common'
import { useStakingStore } from '../stores/stakingStore'
import { HiOutlineCube, HiOutlineBanknotes, HiOutlineGift, HiOutlineUserPlus, HiOutlineSparkles } from 'react-icons/hi2'

const MotionBox = motion.create(Box)
const MotionFlex = motion.create(Flex)

export function HomePage() {
  const navigate = useNavigate()
  const { stakingInfo, tokenBalance, nfts, teamStats } = useStakingStore()

  return (
    <Box>
      <PageHeader />

      <VStack gap="5" p="4" align="stretch">
        {/* 资产概览卡片 */}
        <MotionBox
          bg="linear-gradient(135deg, rgba(79, 70, 229, 0.2) 0%, rgba(139, 92, 246, 0.1) 100%)"
          borderRadius="20px"
          p="5"
          border="1px solid"
          borderColor="rgba(79, 70, 229, 0.3)"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Flex justify="space-between" align="flex-start" mb="4">
            <Box>
              <Text fontSize="sm" color="text.muted" mb="1">
                总资产估值
              </Text>
              <Flex align="baseline" gap="2">
                <Text
                  fontSize="3xl"
                  fontWeight="700"
                  color="text.primary"
                  fontFamily="heading"
                >
                  {(parseFloat(tokenBalance) + parseFloat(stakingInfo.tokenStaked)).toLocaleString()}
                </Text>
                <Text fontSize="sm" color="text.secondary">
                  PFT
                </Text>
              </Flex>
            </Box>
            <Flex
              w="48px"
              h="48px"
              borderRadius="14px"
              bg="rgba(79, 70, 229, 0.2)"
              align="center"
              justify="center"
            >
              <HiOutlineBanknotes size={24} color="#8B5CF6" />
            </Flex>
          </Flex>

          <Flex gap="4">
            <Box flex="1">
              <Text fontSize="xs" color="text.muted">
                可用余额
              </Text>
              <Text fontSize="md" fontWeight="600" color="text.primary">
                {parseFloat(tokenBalance).toLocaleString()} PFT
              </Text>
            </Box>
            <Box flex="1">
              <Text fontSize="xs" color="text.muted">
                质押中
              </Text>
              <Text fontSize="md" fontWeight="600" color="accent.purple">
                {parseFloat(stakingInfo.tokenStaked).toLocaleString()} PFT
              </Text>
            </Box>
          </Flex>
        </MotionBox>

        {/* 快捷操作 */}
        <Box>
          <Text fontSize="sm" fontWeight="600" color="text.secondary" mb="3">
            快捷操作
          </Text>
          <Flex gap="3">
            <ActionButton
              flex="1"
              variant="primary"
              onClick={() => navigate('/staking')}
            >
              <Flex align="center" gap="2">
                <HiOutlineBanknotes size={18} />
                <Text>Token 质押</Text>
              </Flex>
            </ActionButton>
            <ActionButton
              flex="1"
              variant="secondary"
              onClick={() => navigate('/staking?tab=nft')}
            >
              <Flex align="center" gap="2">
                <HiOutlineCube size={18} />
                <Text>NFT 质押</Text>
              </Flex>
            </ActionButton>
          </Flex>
        </Box>

        {/* 数据统计 */}
        <Box>
          <Text fontSize="sm" fontWeight="600" color="text.secondary" mb="3">
            收益数据
          </Text>
          <SimpleGrid columns={2} gap="3">
            <StatCard
              label="待领取收益"
              value={stakingInfo.pendingRewards}
              unit="PFT"
              subValue={`+${stakingInfo.dailyRewards}/天`}
              icon={<HiOutlineGift size={18} />}
              color="accent.green"
              delay={0.1}
            />
            <StatCard
              label="累计收益"
              value={stakingInfo.totalRewards}
              unit="PFT"
              icon={<HiOutlineSparkles size={18} />}
              color="accent.orange"
              delay={0.15}
            />
            <StatCard
              label="年化收益率"
              value={stakingInfo.apr}
              unit="%"
              subValue="APR"
              delay={0.2}
            />
            <StatCard
              label="团队人数"
              value={teamStats.totalMembers.toString()}
              unit="人"
              subValue={`直推 ${teamStats.directMembers} 人`}
              icon={<HiOutlineUserPlus size={18} />}
              color="accent.cyan"
              delay={0.25}
            />
          </SimpleGrid>
        </Box>

        {/* NFT 持仓 */}
        <Box>
          <Flex justify="space-between" align="center" mb="3">
            <Text fontSize="sm" fontWeight="600" color="text.secondary">
              我的 NFT
            </Text>
            <Text
              fontSize="xs"
              color="brand.primary"
              cursor="pointer"
              onClick={() => navigate('/mint')}
            >
              去铸造
            </Text>
          </Flex>

          {nfts.length > 0 ? (
            <Flex gap="3" overflowX="auto" pb="2" css={{ '&::-webkit-scrollbar': { display: 'none' } }}>
              {nfts.map((nft, index) => (
                <MotionFlex
                  key={nft.id}
                  direction="column"
                  minW="140px"
                  bg="bg.card"
                  borderRadius="16px"
                  overflow="hidden"
                  border="1px solid"
                  borderColor={nft.isStaked ? 'accent.purple' : 'border.default'}
                  cursor="pointer"
                  onClick={() => navigate('/staking?tab=nft')}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Box
                    h="100px"
                    bg={`linear-gradient(135deg, ${getCategoryColor(nft.category)} 0%, rgba(0,0,0,0.3) 100%)`}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    position="relative"
                  >
                    <NFTImage
                      src={nft.imageUrl}
                      alt={nft.name}
                      w="60px"
                      h="60px"
                    />
                    {nft.isStaked && (
                      <Box
                        position="absolute"
                        top="2"
                        right="2"
                        px="2"
                        py="0.5"
                        bg="accent.purple"
                        borderRadius="full"
                        fontSize="10px"
                        color="white"
                        fontWeight="600"
                      >
                        质押中
                      </Box>
                    )}
                  </Box>
                  <Box p="3">
                    <Text fontSize="xs" fontWeight="600" color="text.primary" truncate>
                      {nft.name}
                    </Text>
                    <Text fontSize="10px" color="text.muted" textTransform="capitalize">
                      {nft.category}
                    </Text>
                  </Box>
                </MotionFlex>
              ))}
            </Flex>
          ) : (
            <Flex
              direction="column"
              align="center"
              justify="center"
              py="8"
              bg="bg.card"
              borderRadius="16px"
              border="1px dashed"
              borderColor="border.default"
            >
              <HiOutlineCube size={32} color="#71717A" />
              <Text fontSize="sm" color="text.muted" mt="2">
                暂无 NFT
              </Text>
              <ActionButton
                variant="outline"
                size="sm"
                mt="3"
                onClick={() => navigate('/mint')}
              >
                立即铸造
              </ActionButton>
            </Flex>
          )}
        </Box>

        {/* 邀请入口 */}
        <MotionBox
          bg="bg.card"
          borderRadius="16px"
          p="4"
          border="1px solid"
          borderColor="border.default"
          cursor="pointer"
          onClick={() => navigate('/invite')}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          whileTap={{ scale: 0.98 }}
        >
          <Flex justify="space-between" align="center">
            <Flex align="center" gap="3">
              <Flex
                w="44px"
                h="44px"
                borderRadius="12px"
                bg="rgba(217, 70, 239, 0.15)"
                align="center"
                justify="center"
              >
                <HiOutlineUserPlus size={22} color="#D946EF" />
              </Flex>
              <Box>
                <Text fontSize="sm" fontWeight="600" color="text.primary">
                  邀请好友
                </Text>
                <Text fontSize="xs" color="text.muted">
                  分享链接赚取额外奖励
                </Text>
              </Box>
            </Flex>
            <Box color="text.muted">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Box>
          </Flex>
        </MotionBox>
      </VStack>
    </Box>
  )
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    bronze: 'rgba(205, 127, 50, 0.4)',
    silver: 'rgba(192, 192, 192, 0.4)',
    gold: 'rgba(255, 215, 0, 0.4)',
    platinum: 'rgba(229, 228, 226, 0.4)',
    diamond: 'rgba(185, 242, 255, 0.4)',
  }
  return colors[category] || colors.bronze
}
