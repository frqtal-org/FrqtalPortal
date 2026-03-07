import React, { memo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Typography } from '../../../../core/components/Typography.tsx';
import { sizeToDp } from '../../../../core/utils/sizeToDP.tsx';
import { APP_PADDING } from '../../../../core/utils/constants.ts';
import theme from '../../../../core/utils/styles/styles.ts';

const LIST_STATUS_FILTERS = [
  {
    label: 'Todas',
    selectionValue: 'all'
  },
  {
    label: 'Exitosas',
    selectionValue: 'successful'
  },
  {
    label: 'Devueltas',
    selectionValue: 'returned and cancelled'
  },
]

const FilterBadge = memo(({ timeLabel, isSelected, onPress }: any) => {
  return (
    <Pressable
      hitSlop={sizeToDp(APP_PADDING * 1.3)}
      onPress={onPress}
      style={[
        STYLES.filterBadge,
        isSelected && STYLES.timeFrameSelected,
      ]}>
      <Typography color={isSelected ? 'textPrimary' : 'textEleventh'} variant="text01Medium">{timeLabel}</Typography>
    </Pressable>
  );
});

export const Filters = memo(({ style = [{}], onPress }: any) => {
  /*  */
  const [selectedFilter, setSelectedFilter] = useState('all');
  /*  */

  /* ------- FUNCTIONS ------- */
  function handlePressFilterBadge({ selectionValue }: any) {
    if (selectedFilter === selectionValue) return
    setSelectedFilter(selectionValue);
    onPress(selectionValue)
  }
  /* ------- END FUNCTIONS ------- */

  return (
    <View style={[{ paddingTop: sizeToDp(APP_PADDING * 0), alignItems: 'center', flexDirection: 'row', columnGap: sizeToDp(APP_PADDING * 0.7), zIndex: 999 }]} >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[STYLES.headerFiltersContainer]}>
        {LIST_STATUS_FILTERS.map((i: any) => (
          <View key={`transactions-timeframe-selector-${i.label}`} style={[style]} >
            <FilterBadge
              timeLabel={i.label}
              isSelected={selectedFilter === i.selectionValue}
              onPress={() =>
                handlePressFilterBadge({ selectionValue: i.selectionValue })
              }
            />
          </View>
        ))}
      </ScrollView>

    </View>

  );
});

const STYLES = StyleSheet.create({
  filterBadge: {
    paddingHorizontal: sizeToDp(APP_PADDING * 0.8),
    paddingVertical: sizeToDp(APP_PADDING * 0.4),
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: sizeToDp(1),
    backgroundColor: theme.colors.brand400 + '22',
    borderColor: theme.colors.brand400 + 'aa',
  },
  timeFrameSelected: {
    backgroundColor: theme.colors.brand300 + '22',
    borderColor: theme.colors.brand300 + 'aa',
    borderWidth: sizeToDp(1),
  },

  headerFiltersContainer: {
    flexDirection: 'row',
    columnGap: sizeToDp(APP_PADDING * 0.5),
    paddingHorizontal: sizeToDp(APP_PADDING * 0.8),
    zIndex: 999
  },
});
