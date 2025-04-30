import React from 'react';

const EmptyData: React.FC<{ text?: string; className?: string }> = (props) => (
	<div className={`text-themeGray-text flex flex-col items-center justify-center text-center ${props.className}`}>
		<div className='text-textGray text-center'>
			<p className='text-lg font-semibold'>Ooops, Nothing Here Yet!</p>
		</div>
	</div>
);

export default EmptyData;
