import { Bound } from '../../state/mint/v3/actions';
import { AutoColumn } from 'components/v3/Column';
import { Position } from 'v3lib/entities';
import { PositionPreview } from 'components/v3/PositionPreview';

interface ReviewProps {
  position?: Position;
  outOfRange: boolean;
  ticksAtLimit: { [bound in Bound]?: boolean | undefined };
}

export function Review({ position, outOfRange, ticksAtLimit }: ReviewProps) {
  return (
    <div className={'pt-05'}>
      <AutoColumn gap='lg'>
        {position ? (
          <PositionPreview
            position={position}
            inRange={!outOfRange}
            ticksAtLimit={ticksAtLimit}
            title={`Selected Range`}
          />
        ) : null}
      </AutoColumn>
    </div>
  );
}
