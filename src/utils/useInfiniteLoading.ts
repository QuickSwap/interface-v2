import useInView from 'react-cool-inview';

export const useInfiniteLoading = (loadNext: () => void) => {
  const { observe } = useInView({
    onChange: () => {
      loadNext();
    },
  });

  return {
    loadMoreRef: observe,
  };
};
