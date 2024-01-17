import React, { useEffect } from 'react';
import { useActiveWeb3React } from 'hooks';
import { getConfig } from 'config/index';
import { useRouter } from 'next/router';
import { GetStaticProps, InferGetStaticPropsType } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { ConvertQuick } from 'components';

const ConvertQUICKPage = (
  _props: InferGetStaticPropsType<typeof getStaticProps>,
) => {
  const { chainId } = useActiveWeb3React();

  const config = getConfig(chainId);
  const showConvert = config['convert']['available'];
  const router = useRouter();

  useEffect(() => {
    if (!showConvert) {
      router.push('/');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showConvert]);

  return <ConvertQuick />;
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  };
};

export default ConvertQUICKPage;
