import useInView from 'react-cool-inview';

export const useInfiniteLoading = (loadNext: () => void) => {
  const { observe } = useInView({
    onEnter: () => {
      loadNext();
    },
  });

  return {
    loadMoreRef: observe,
  };
};
